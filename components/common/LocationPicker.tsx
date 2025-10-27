import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
  Platform,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { WebView } from 'react-native-webview';
import { Coordinates } from '../../types';
import { LocationServiceExpo as LocationService, LocationResult } from '../../services/location-expo';
import { Colors } from '../../constants/colors';

// Mapear cores para compatibilidade
const colors = {
  primary: Colors.primary,
  secondary: Colors.secondary,
  background: Colors.background,
  surface: Colors.surface,
  surfaceVariant: '#F8F9FA',
  text: Colors.text,
  textSecondary: Colors.textSecondary,
  border: Colors.border,
};

interface LocationPickerProps {
  onLocationSelect: (coordinates: Coordinates, address?: string) => void;
  initialCoordinates?: Coordinates;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

interface MapMarker {
  coordinates: Coordinates;
  address?: string;
}

const { width, height } = Dimensions.get('window');

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialCoordinates,
  visible,
  onClose,
  title = 'Selecionar Localização',
}) => {
  const { t } = useTranslation();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: initialCoordinates?.latitude || -8.8379, // Luanda por padrão
    longitude: initialCoordinates?.longitude || 13.2894,
    zoom: 15,
  });

  useEffect(() => {
    if (initialCoordinates) {
      setSelectedMarker({
        coordinates: initialCoordinates,
      });
      setMapRegion({
        latitude: initialCoordinates.latitude,
        longitude: initialCoordinates.longitude,
        zoom: 15,
      });
    }
  }, [initialCoordinates]);

  // HTML do mapa OpenStreetMap com Leaflet
  const getMapHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mapa Interativo</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { 
            height: 100vh; 
            width: 100vw; 
            cursor: crosshair;
        }
        .info-panel {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .coordinates {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="info-panel">
        <div>🎯 <strong>Toque no mapa para marcar sua localização</strong></div>
        <div class="coordinates" id="coords">Região: ${mapRegion.latitude.toFixed(6)}, ${mapRegion.longitude.toFixed(6)}</div>
    </div>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        let map;
        let marker;
        let isReady = false;

        // Inicializar mapa
        function initMap() {
            map = L.map('map', {
                zoomControl: true,
                attributionControl: true
            }).setView([${mapRegion.latitude}, ${mapRegion.longitude}], ${mapRegion.zoom});

            // Adicionar camada do OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Evento de clique no mapa
            map.on('click', function(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                // Adicionar marcador de seleção
                addSelectionMarker(lat, lng);
                
                // Atualizar coordenadas na tela
                document.getElementById('coords').textContent = 
                    'Selecionado: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                
                // Enviar coordenadas para React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOCATION_SELECTED',
                    latitude: lat,
                    longitude: lng
                }));
            });

            // Adicionar marcador inicial se houver coordenadas
            ${initialCoordinates ? `
            marker = L.marker([${initialCoordinates.latitude}, ${initialCoordinates.longitude}], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background-color: #FF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
            
            document.getElementById('coords').textContent = 
                'Selecionado: ${initialCoordinates.latitude.toFixed(6)}, ${initialCoordinates.longitude.toFixed(6)}';
            ` : ''}

            isReady = true;
            
            // Notificar React Native que o mapa está pronto
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MAP_READY'
            }));
        }

        // Função para centralizar o mapa em uma coordenada
        function centerMap(lat, lng, zoom = 15) {
            console.log('🗺️ Centralizando mapa em:', lat, lng, 'zoom:', zoom);
            if (map && isReady) {
                map.setView([lat, lng], zoom);
                
                // Atualizar coordenadas na tela
                document.getElementById('coords').textContent = 
                    'Centralizado: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
            }
        }

        // Função para adicionar marcador de pesquisa (azul)
        function addSearchMarker(lat, lng) {
            console.log('🔵 Adicionando marcador de pesquisa:', lat, lng);
            if (marker) {
                map.removeLayer(marker);
            }
            
            marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'search-marker',
                    html: '<div style="background-color: #2196F3; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map);
            
            // Atualizar coordenadas na tela
            document.getElementById('coords').textContent = 
                'Pesquisado: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
        }

        // Função para adicionar marcador de seleção (vermelho)
        function addSelectionMarker(lat, lng) {
            console.log('🔴 Adicionando marcador de seleção:', lat, lng);
            if (marker) {
                map.removeLayer(marker);
            }
            
            marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'selection-marker',
                    html: '<div style="background-color: #FF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map);
            
            // Atualizar coordenadas na tela
            document.getElementById('coords').textContent = 
                'Selecionado: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
        }

        // Receber mensagens do React Native
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 Mensagem recebida:', data);
                
                switch(data.type) {
                    case 'CENTER_MAP':
                        centerMap(data.latitude, data.longitude, data.zoom || 15);
                        break;
                        
                    case 'SELECT_SEARCH_RESULT':
                        // Primeiro centralizar
                        centerMap(data.latitude, data.longitude, data.zoom || 16);
                        // Depois adicionar marcador de seleção
                        setTimeout(() => {
                            addSelectionMarker(data.latitude, data.longitude);
                        }, 300);
                        break;
                        
                    default:
                        console.log('Tipo de mensagem desconhecido:', data.type);
                }
            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
            }
        });

        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', initMap);
    </script>
</body>
</html>
    `;
  };

  const handleMapPress = async (coordinate: Coordinates) => {
    console.log('📍 Coordenada selecionada no mapa:', coordinate);
    
    setSelectedMarker({
      coordinates: coordinate,
    });

    // Obter endereço da coordenada selecionada
    setIsLoadingAddress(true);
    try {
      const reverseResult = await LocationService.reverseGeocode(
        coordinate.latitude,
        coordinate.longitude
      );
      
      setSelectedMarker({
        coordinates: coordinate,
        address: reverseResult.formattedAddress,
      });
    } catch (error) {
      console.log('⚠️ Não foi possível obter endereço da coordenada selecionada');
      setSelectedMarker({
        coordinates: coordinate,
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Lidar com mensagens da WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'MAP_READY':
          console.log('🗺️ Mapa OpenStreetMap carregado');
          setIsMapReady(true);
          break;
          
        case 'LOCATION_SELECTED':
          const coordinates: Coordinates = {
            latitude: data.latitude,
            longitude: data.longitude,
          };
          handleMapPress(coordinates);
          break;
          
        default:
          console.log('Mensagem desconhecida da WebView:', data);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem da WebView:', error);
    }
  };

  // Centralizar mapa em uma coordenada
  const centerMapOnLocation = (coords: Coordinates) => {
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'CENTER_MAP',
        latitude: coords.latitude,
        longitude: coords.longitude,
        zoom: 16
      });
      webViewRef.current.postMessage(message);
    }
  };

  // Pesquisar localização usando Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1&countrycodes=ao`,
        {
          headers: {
            'User-Agent': 'HealthApp/1.0 (Angola Health Services Locator)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 Resultados da pesquisa:', data.length);
      
      const results = data.map((item: any) => ({
        id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        importance: parseFloat(item.importance || '0.5'),
      }));

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('❌ Erro na pesquisa:', error);
      Alert.alert(
        'Erro na Pesquisa',
        'Não foi possível pesquisar a localização. Verifique sua conexão.'
      );
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Selecionar resultado da pesquisa
  const selectSearchResult = (result: any) => {
    const coordinates: Coordinates = {
      latitude: result.lat,
      longitude: result.lon,
    };

    console.log('📍 Selecionando coordenadas da pesquisa:', coordinates);

    // Função para enviar mensagem para WebView
    const sendToWebView = () => {
      if (webViewRef.current) {
        const message = JSON.stringify({
          type: 'SELECT_SEARCH_RESULT',
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          zoom: 16
        });
        console.log('📨 Enviando mensagem para WebView:', message);
        webViewRef.current.postMessage(message);
      }
    };

    // Centralizar mapa no resultado e adicionar marcador
    if (isMapReady) {
      sendToWebView();
    } else {
      console.log('⚠️ Mapa não está pronto, tentando novamente em 1s...');
      setTimeout(() => {
        if (isMapReady) {
          sendToWebView();
        } else {
          console.log('⚠️ Mapa ainda não está pronto após timeout');
        }
      }, 1000);
    }
    
    // Processar seleção da coordenada
    handleMapPress(coordinates);
    
    // Limpar pesquisa
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    Keyboard.dismiss();
    
    console.log('✅ Local selecionado da pesquisa:', result.display_name);
  };

  // Debounce para pesquisa automática
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUseCurrentLocation = async () => {
    console.log('🎯 Obtendo localização atual...');
    try {
      const locationResult = await LocationService.getCurrentLocation();
      if (locationResult) {
        const marker: MapMarker = {
          coordinates: locationResult.coordinates,
          address: locationResult.address,
        };
        setSelectedMarker(marker);
        setMapRegion({
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude,
          zoom: 16,
        });
        // Centralizar mapa na nova localização usando GPS
        if (webViewRef.current && isMapReady) {
          const message = JSON.stringify({
            type: 'SELECT_SEARCH_RESULT',
            latitude: locationResult.coordinates.latitude,
            longitude: locationResult.coordinates.longitude,
            zoom: 16
          });
          webViewRef.current.postMessage(message);
        }
        Alert.alert(
          'Localização Obtida!',
          `Sua localização foi capturada com precisão de ${locationResult.accuracy.toFixed(0)} metros.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro de Localização',
        t('forms.locationNotAvailable')
      );
    }
  };

  const handleConfirmLocation = () => {
    if (selectedMarker) {
      onLocationSelect(selectedMarker.coordinates, selectedMarker.address);
      onClose();
    } else {
      Alert.alert(t('forms.selectLocation'), t('forms.selectLocationMessage'));
    }
  };

  const formatCoordinates = (coords: Coordinates): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  // Componente de mapa real usando OpenStreetMap via WebView
  const MapComponent = () => {
    return (
      <View style={styles.mapContainer}>
        {!isMapReady && (
          <View style={styles.mapLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.mapLoadingText}>{t('app.loadingMap')}</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: getMapHTML() }}
          style={[styles.webView, !isMapReady && styles.hiddenWebView]}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLoadEnd={() => {
            console.log('🌐 WebView carregamento concluído');
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ Erro no WebView:', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ Erro HTTP no WebView:', nativeEvent);
          }}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Campo de Pesquisa */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar localização (ex: Rua da Missão, Luanda)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
              returnKeyType="search"
              onSubmitEditing={() => searchLocation(searchQuery)}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
            )}
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                  Keyboard.dismiss();
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Resultados da Pesquisa */}
          {searchQuery.length >= 3 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.searchResultsList}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => selectSearchResult(item)}
                    >
                      <Text style={styles.searchResultText} numberOfLines={2}>
                        {item.display_name}
                      </Text>
                      <Text style={styles.searchResultType}>
                        {item.type} • {(item.importance * 100).toFixed(0)}% relevância
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : !isSearching ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    🔍 Nenhum resultado encontrado para "{searchQuery}"
                  </Text>
                  <Text style={styles.noResultsHint}>
                    Tente pesquisar por rua, bairro ou ponto de referência
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        <MapComponent />

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Text style={styles.currentLocationButtonText}>
              📍 Usar Minha Localização
            </Text>
          </TouchableOpacity>

          {selectedMarker && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoTitle}>📍 Localização Selecionada:</Text>
              <Text style={styles.selectedInfoCoords}>
                {formatCoordinates(selectedMarker.coordinates)}
              </Text>
              {isLoadingAddress ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Obtendo endereço...</Text>
                </View>
              ) : (
                selectedMarker.address && (
                  <Text style={styles.selectedInfoAddress} numberOfLines={3}>
                    {selectedMarker.address}
                  </Text>
                )
              )}
            </View>
          )}

          {!selectedMarker && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                🗺️ Toque no mapa OpenStreetMap acima para selecionar uma localização precisa
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                !selectedMarker && styles.disabledButton
              ]}
              onPress={handleConfirmLocation}
              disabled={!selectedMarker}
            >
              <Text style={[
                styles.confirmButtonText,
                !selectedMarker && styles.disabledButtonText
              ]}>
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    position: 'relative',
  },
  mapPlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  mapInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  mapCenter: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  markerInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  markerCoordinates: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  markerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  controls: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedInfo: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedInfoCoords: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  selectedInfoAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  // Estilos para WebView com mapa real
  mapLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    zIndex: 1000,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
  },
  hiddenWebView: {
    opacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  instructionsContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Estilos para campo de pesquisa
  searchContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
    zIndex: 100,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  searchLoader: {
    marginRight: 8,
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    maxHeight: 200,
    zIndex: 1000,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  searchResultType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  noResultsHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});