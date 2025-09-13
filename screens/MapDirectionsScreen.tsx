import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { HealthService, Region } from '../types';
import { MapDirectionsScreenNavigationProp, MapDirectionsScreenRouteProp } from '../types/navigation';
import { Colors, spacing, borderRadius, fontSize } from '../constants';
import { useLocation } from '../hooks/useLocation';

interface MapDirectionsScreenProps {
  navigation: MapDirectionsScreenNavigationProp;
  route: MapDirectionsScreenRouteProp;
}

interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

export const MapDirectionsScreen: React.FC<MapDirectionsScreenProps> = ({
  navigation,
  route,
}) => {
  const { service } = route.params;
  const { location } = useLocation();
  const webViewRef = React.useRef<WebView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: service.coordinates.latitude || -8.8379,
    longitude: service.coordinates.longitude || 13.2894,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Função para lidar com mensagens do WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'routeInfo') {
        setRouteInfo({
          distance: data.distance,
          duration: data.duration
        });
      }
    } catch (error) {
      console.log('Erro ao processar mensagem do WebView:', error);
    }
  };

  useEffect(() => {
    if (location) {
      try {
        // Calcular a região que inclui tanto o usuário quanto o destino
        const minLat = Math.min(location.latitude, service.coordinates.latitude);
        const maxLat = Math.max(location.latitude, service.coordinates.latitude);
        const minLon = Math.min(location.longitude, service.coordinates.longitude);
        const maxLon = Math.max(location.longitude, service.coordinates.longitude);
        
        const latDelta = (maxLat - minLat) * 1.5 || 0.05;
        const lonDelta = (maxLon - minLon) * 1.5 || 0.05;
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLon + maxLon) / 2,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lonDelta, 0.01),
        });
      } catch (error) {
        console.log('Error setting region:', error);
        // Fallback para coordenadas padrão de Luanda
        setRegion({
          latitude: -8.8379,
          longitude: 13.2894,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } else {
      // Se não temos localização, centramos no destino
      setRegion({
        latitude: service.coordinates.latitude || -8.8379,
        longitude: service.coordinates.longitude || 13.2894,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location, service]);

  const handleBack = () => {
    navigation.goBack();
  };

  const generateMapHTML = () => {
    const userLat = location?.latitude || -8.8379;
    const userLng = location?.longitude || 13.2894;
    const destLat = service.coordinates.latitude;
    const destLng = service.coordinates.longitude;
    
    // Calcular centro
    const centerLat = (userLat + destLat) / 2;
    const centerLng = (userLng + destLng) / 2;
    
    const apiKey = "AIzaSyCoqbjFQjZJSbU5-3xk7A9VqiDiMLKPeyM";
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            .gm-style-iw { 
                font-family: Arial, sans-serif; 
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            function initMap() {
                console.log('Inicializando Google Maps...');
                const userLocation = { lat: ${userLat}, lng: ${userLng} };
                const destination = { lat: ${destLat}, lng: ${destLng} };
                
                console.log('Localização do usuário:', userLocation);
                console.log('Destino:', destination);
                
                // Criar o mapa
                const map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 13,
                    center: { lat: ${centerLat}, lng: ${centerLng} },
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true,
                    streetViewControl: true,
                    rotateControl: false,
                    fullscreenControl: true,
                    clickableIcons: true,
                    gestureHandling: 'auto',
                    restriction: {
                        latLngBounds: {
                            north: -4.0,
                            south: -18.0,
                            west: 11.0,
                            east: 24.0
                        }
                    }
                });
                
                // Marcador do usuário (azul)
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Sua localização',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#4285f4',
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 3,
                    }
                });
                
                // Info window para usuário
                const userInfoWindow = new google.maps.InfoWindow({
                    content: '<div style="padding: 5px;"><strong>Sua localização</strong></div>'
                });
                
                userMarker.addListener('click', () => {
                    userInfoWindow.open(map, userMarker);
                });
                
                // Marcador do destino (vermelho)
                const destinationMarker = new google.maps.Marker({
                    position: destination,
                    map: map,
                    title: '${service.name}',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#ea4335',
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 3,
                    }
                });
                
                // Info window para destino
                const destInfoWindow = new google.maps.InfoWindow({
                    content: '<div style="padding: 5px;"><strong>${service.name}</strong><br><small>${service.address}</small></div>'
                });
                
                destinationMarker.addListener('click', () => {
                    destInfoWindow.open(map, destinationMarker);
                });
                
                // Serviço de direções
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: true, // Não mostrar marcadores padrão
                    draggable: false,
                    preserveViewport: false,
                    polylineOptions: {
                        strokeColor: '#2E7D32',
                        strokeOpacity: 0.8,
                        strokeWeight: 6,
                        geodesic: false, // Importante: seguir as vias
                        icons: [{
                            icon: {
                                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                                strokeColor: '#2E7D32',
                                strokeWeight: 3,
                                scale: 1
                            },
                            repeat: '100px'
                        }]
                    },
                    markerOptions: {
                        visible: false
                    }
                });
                
                // Calcular rota com configurações otimizadas
                console.log('Calculando rota...');
                directionsService.route({
                    origin: userLocation,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false,
                    optimizeWaypoints: true,
                    region: 'AO' // Código do país Angola
                }, (result, status) => {
                    console.log('Status da rota:', status);
                    if (status === 'OK') {
                        console.log('Rota calculada com sucesso!');
                        directionsRenderer.setDirections(result);
                        
                        // Enviar informações da rota para o React Native
                        const route = result.routes[0];
                        const leg = route.legs[0];
                        const distance = leg.distance.text;
                        const duration = leg.duration.text;
                        
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'routeInfo',
                            distance: distance,
                            duration: duration
                        }));
                    } else {
                        console.error('Erro ao calcular rota:', status);
                        
                        // Tentar alternativas baseadas no tipo de erro
                        if (status === 'ZERO_RESULTS') {
                            // Tentar com modo a pé se carro não funcionar
                            directionsService.route({
                                origin: userLocation,
                                destination: destination,
                                travelMode: google.maps.TravelMode.WALKING,
                                unitSystem: google.maps.UnitSystem.METRIC,
                                region: 'AO'
                            }, (walkResult, walkStatus) => {
                                if (walkStatus === 'OK') {
                                    directionsRenderer.setDirections(walkResult);
                                    const route = walkResult.routes[0];
                                    const leg = route.legs[0];
                                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                                        type: 'routeInfo',
                                        distance: leg.distance.text,
                                        duration: leg.duration.text + ' (a pé)'
                                    }));
                                } else {
                                    // Último fallback: linha reta estimada
                                    drawStraightLine();
                                }
                            });
                        } else {
                            drawStraightLine();
                        }
                        
                        function drawStraightLine() {
                            const routePath = new google.maps.Polyline({
                                path: [userLocation, destination],
                                geodesic: true,
                                strokeColor: '#FF9800',
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                                strokeStyle: 'dashed'
                            });
                            routePath.setMap(map);
                            
                            // Calcular distância estimada
                            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                                new google.maps.LatLng(userLocation.lat, userLocation.lng),
                                new google.maps.LatLng(destination.lat, destination.lng)
                            );
                            const distanceKm = (distance / 1000).toFixed(1);
                            const estimatedTime = Math.round(distance / 1000 * 4); // ~15 km/h média
                            
                            window.ReactNativeWebView?.postMessage(JSON.stringify({
                                type: 'routeInfo',
                                distance: distanceKm + ' km',
                                duration: estimatedTime + ' min (estimado)'
                            }));
                        }
                    }
                });
                
                // Ajustar bounds para mostrar ambos os pontos
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(userLocation);
                bounds.extend(destination);
                map.fitBounds(bounds);
                
                // Adicionar padding aos bounds
                google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
                    if (map.getZoom() > 15) {
                        map.setZoom(15);
                    }
                });
            }
            
            // Função para lidar com erros de carregamento
            function handleError() {
                document.getElementById('map').innerHTML = 
                    '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial; color: #666;">' +
                    'Erro ao carregar o mapa. Verifique sua conexão.' +
                    '</div>';
            }
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry,places&language=pt&region=AO" 
                async defer onerror="handleError()"></script>
    </body>
    </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Direções</Text>
          <Text style={styles.headerSubtitle}>{service.name}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: generateMapHTML() }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
        />
      </View>

      {/* Informações da rota */}
      {routeInfo && (
        <View style={styles.routeInfo}>
          <View style={styles.routeStats}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text style={styles.statText}>{routeInfo.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.statText}>{routeInfo.distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="car" size={20} color={Colors.primary} />
              <Text style={styles.statText}>Carro</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: Colors.text.secondary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  routeInfo: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  routeStats: {
    flexDirection: 'row',
    padding: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: spacing.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: borderRadius.md,
  },
  directionsButtonText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  directionsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: 200,
  },
  directionStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: Colors.text.onPrimary,
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: fontSize.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  stepDistance: {
    fontSize: fontSize.sm,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
  },
});
