import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HealthService, Coordinates, Region } from '../../types';
import { LocationService } from '../../services/location';
import { Colors, spacing } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  getServiceColor, 
  getServiceIcon, 
  calculateCategoryStats,
  CategoryStats 
} from '../../constants/categories';
import { MapCategoryLegend } from './MapCategoryLegend';

interface InteractiveMapProps {
  services: HealthService[];
  initialRegion?: Region;
  userLocation?: Coordinates;
  onServicePress?: (service: HealthService) => void;
  onLocationChange?: (location: Coordinates) => void;
  showUserLocation?: boolean;
  autoZoomToServices?: boolean;
  enableClustering?: boolean;
  categoryColors?: Record<string, string>;
  selectedCategories?: string[];
  onCategoryToggle?: (categoryId: string) => void;
  showCategoryLegend?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  services = [],
  initialRegion,
  userLocation: propUserLocation,
  onServicePress,
  onLocationChange,
  showUserLocation = true,
  autoZoomToServices = true,
  enableClustering = true,
  categoryColors,
  selectedCategories = [],
  onCategoryToggle,
  showCategoryLegend = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const locateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<Coordinates | null>(
    propUserLocation || null
  );
  const [mapRegion, setMapRegion] = useState<Region>(
    initialRegion || {
      latitude: -8.8383,
      longitude: 13.2344,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
  );
  const [userManuallyLocated, setUserManuallyLocated] = useState(false);
  const [initialAutoZoomDone, setInitialAutoZoomDone] = useState(false);
  const [userLocationActivated, setUserLocationActivated] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  // Auto-locate user on component mount
  useEffect(() => {
    if (showUserLocation && !currentUserLocation && !userLocationActivated) {
      handleLocateUser();
    }
  }, [showUserLocation]);

  // Update user location when prop changes
  useEffect(() => {
    if (propUserLocation) {
      setCurrentUserLocation(propUserLocation);
    }
  }, [propUserLocation]);

  // Auto-zoom to services when they change (but only once initially and not if user manually located)
  useEffect(() => {
    if (autoZoomToServices && 
        services.length > 0 && 
        isMapReady && 
        !userManuallyLocated && 
        !initialAutoZoomDone &&
        !userLocationActivated) {
      // Only auto-zoom once initially and not after user interaction
      console.log('🗺️ Auto-zoom inicial para serviços');
      const timeout = setTimeout(() => {
        fitToServices();
        setInitialAutoZoomDone(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [services, autoZoomToServices, isMapReady, userManuallyLocated, initialAutoZoomDone, userLocationActivated]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (locateTimeoutRef.current) {
        clearTimeout(locateTimeoutRef.current);
      }
    };
  }, []);

  const handleLocateUser = async () => {
    setIsLocating(true);
    console.log('📍 LOCATE ME: Iniciando localização manual do usuário...');
    
    try {
      const locationResult = await LocationService.getLocationWithFallback();
      
      if (locationResult) {
        const newLocation = {
          latitude: locationResult.coordinates.latitude,
          longitude: locationResult.coordinates.longitude
        };
        
        console.log('✅ LOCATE ME: Localização obtida:', newLocation);
        
        // 🔒 BLOQUEAR QUALQUER AUTO-ZOOM FUTURO
        setUserManuallyLocated(true);
        setUserLocationActivated(true);
        setInitialAutoZoomDone(true);
        
        // Atualizar localização atual
        setCurrentUserLocation(newLocation);
        onLocationChange?.(newLocation);
        
        // Região focada no usuário com zoom próximo
        const userRegion = {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta: 0.003, // Zoom mais próximo
          longitudeDelta: 0.003
        };
        
        console.log('🎯 LOCATE ME: Centralizando mapa na localização (bloqueando auto-zoom)');
        setMapRegion(userRegion);
        
        // Atualizar mapa imediatamente
        updateMapView(userRegion, newLocation, true);
        
        // 🔒 SEGUNDA VERIFICAÇÃO: Garantir que não há race condition
        setTimeout(() => {
          console.log('🔐 LOCATE ME: Verificação final - mantendo localização do usuário');
          updateMapView(userRegion, newLocation, true);
        }, 500);
        
      } else {
        Alert.alert(
          'Location Unavailable',
          'Unable to get your current location. Please check your location settings.'
        );
      }
    } catch (error) {
      console.error('❌ LOCATE ME ERROR:', error);
      Alert.alert(
        'Location Error',
        'Failed to get your location. Please try again.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const fitToServices = useCallback(() => {
    if (services.length === 0) return;
    
    console.log('📊 Ajustando mapa para mostrar todos os serviços');
    
    const lats = services.map(s => s.coordinates.latitude);
    const lngs = services.map(s => s.coordinates.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2; // Add 20% padding
    const deltaLng = (maxLng - minLng) * 1.2;
    
    const newRegion = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01)
    };
    
    setMapRegion(newRegion);
    updateMapView(newRegion, currentUserLocation);
  }, [services, currentUserLocation]);

  const handleShowAllServices = () => {
    console.log('📊 Mostrando todos os serviços...');
    // This is a manual action
    setUserManuallyLocated(false);
    setUserLocationActivated(false); // Allow location button to work again
    setInitialAutoZoomDone(true);
    fitToServices();
  };

  const updateMapView = (region: Region, userLoc: Coordinates | null, forceUpdate: boolean = false) => {
    if (webViewRef.current) {
      const script = `
        if (window.map) {
          // Force map update with animation disabled for immediate response
          window.map.setView([${region.latitude}, ${region.longitude}], 
            ${calculateZoomLevel(region.latitudeDelta)}, {animate: ${forceUpdate ? 'false' : 'true'}});
          
          ${userLoc ? `
            if (window.userMarker) {
              window.userMarker.setLatLng([${userLoc.latitude}, ${userLoc.longitude}]);
            } else {
              // Create user marker if it doesn't exist
              const userIcon = L.divIcon({
                className: 'user-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });
              
              window.userMarker = L.marker([${userLoc.latitude}, ${userLoc.longitude}], {
                icon: userIcon,
                zIndexOffset: 1000
              }).addTo(window.map);
              
              window.userMarker.bindPopup('<div class="popup-content"><div class="popup-title">Your Location</div></div>');
            }
          ` : ''}
        }
        true;
      `;
      webViewRef.current.postMessage(JSON.stringify({ type: 'updateView', script }));
    }
  };

  const calculateZoomLevel = (latitudeDelta: number): number => {
    if (latitudeDelta > 5) return 6;
    if (latitudeDelta > 2) return 8;
    if (latitudeDelta > 1) return 10;
    if (latitudeDelta > 0.5) return 12;
    if (latitudeDelta > 0.1) return 14;
    if (latitudeDelta > 0.05) return 15;
    if (latitudeDelta > 0.01) return 16;
    return 17;
  };

  const getServiceColorForMap = (service: HealthService): string => {
    // Use the new category system
    return getServiceColor(service.type || 'general');
  };

  const handleServiceClick = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && onServicePress) {
      onServicePress(service);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapReady':
          setIsMapReady(true);
          if (autoZoomToServices && services.length > 0) {
            setTimeout(() => fitToServices(), 500);
          }
          break;
          
        case 'serviceClick':
          handleServiceClick(data.serviceId);
          break;
          
        case 'mapClick':
          // Handle map clicks if needed
          console.log('Map clicked at:', data.coordinates);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Calculate category statistics
  useEffect(() => {
    if (services.length > 0) {
      const stats = calculateCategoryStats(services);
      setCategoryStats(stats);
    }
  }, [services]);

  // Filter services by category if categories are selected
  const filteredServices = selectedCategories.length === 0 
    ? services 
    : services.filter(service => {
        const serviceType = service.type || 'general';
        // Import getCategoryByType to properly match categories
        const { getCategoryByType } = require('../../constants/categories');
        const serviceCategory = getCategoryByType(serviceType);
        return selectedCategories.includes(serviceCategory.id);
      });

  const servicesJSON = JSON.stringify(filteredServices.map(service => ({
    ...service,
    color: getServiceColorForMap(service),
    icon: getServiceIcon(service.type || 'general')
  })));

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      ${enableClustering ? `
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      ` : ''}
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          height: 100vh; 
          width: 100vw; 
          background: #f5f5f5;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .service-marker {
          border: 2px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .service-marker:hover {
          transform: scale(1.1);
        }
        .user-marker {
          background: #2196F3;
          border: 3px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
          position: relative;
        }
        .user-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        .popup-content {
          text-align: center;
          min-width: 200px;
        }
        .popup-title {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }
        .popup-category {
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin: 5px 0;
          display: inline-block;
        }
        .popup-address {
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">
        Loading map...
      </div>
      <div id="map"></div>
      
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      ${enableClustering ? `
      <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
      ` : ''}
      
      <script>
        // Global variables
        window.map = null;
        window.userMarker = null;
        window.servicesLayer = null;
        
        // Initialize map
        function initMap() {
          try {
            window.map = L.map('map', {
              zoomControl: true,
              attributionControl: false,
              touchZoom: true,
              doubleClickZoom: true,
              scrollWheelZoom: true,
              dragging: true,
              maxZoom: 18,
              minZoom: 3
            }).setView([${mapRegion.latitude}, ${mapRegion.longitude}], ${calculateZoomLevel(mapRegion.latitudeDelta)});
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(window.map);
            
            // Add user location marker
            ${currentUserLocation ? `
              const userIcon = L.divIcon({
                className: 'user-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });
              
              window.userMarker = L.marker([${currentUserLocation.latitude}, ${currentUserLocation.longitude}], {
                icon: userIcon,
                zIndexOffset: 1000
              }).addTo(window.map);
              
              window.userMarker.bindPopup('<div class="popup-content"><div class="popup-title">Your Location</div></div>');
            ` : ''}
            
            // Add services
            addServices();
            
            // Map event listeners
            window.map.on('click', function(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                coordinates: [e.latlng.lat, e.latlng.lng]
              }));
            });
            
            // Hide loading
            document.getElementById('loading').style.display = 'none';
            
            // Notify React Native that map is ready
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady'
            }));
            
          } catch (error) {
            console.error('Map initialization error:', error);
          }
        }
        
        function addServices() {
          const services = ${servicesJSON};
          
          if (!services || services.length === 0) return;
          
          ${enableClustering ? `
            window.servicesLayer = L.markerClusterGroup({
              maxClusterRadius: 50,
              iconCreateFunction: function(cluster) {
                return L.divIcon({
                  html: '<div style="background: #2E7D32; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">' + cluster.getChildCount() + '</div>',
                  className: 'custom-cluster',
                  iconSize: [40, 40]
                });
              }
            });
          ` : `
            window.servicesLayer = L.layerGroup();
          `}
          
          services.forEach(function(service) {
            const icon = getServiceIcon(service.type);
            const color = service.color || '#2E7D32';
            
            const serviceIcon = L.divIcon({
              className: 'service-marker',
              html: '<div style="background: ' + color + '; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center;">' + icon + '</div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            
            const marker = L.marker([service.coordinates.latitude, service.coordinates.longitude], {
              icon: serviceIcon
            });
            
            // Popup content
            const popupContent = 
              '<div class="popup-content">' +
                '<div class="popup-title">' + (service.name || 'Healthcare Service') + '</div>' +
                '<div class="popup-category">' + (service.type || 'General') + '</div>' +
                '<div class="popup-address">' + (service.address || 'Address not available') + '</div>' +
              '</div>';
            
            marker.bindPopup(popupContent);
            
            // Click handler
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'serviceClick',
                serviceId: service.id
              }));
            });
            
            window.servicesLayer.addLayer(marker);
          });
          
          window.servicesLayer.addTo(window.map);
        }
        
        function getServiceIcon(type) {
          // Use the icon from the service data, or fallback to category icon
          return type || '🏥';
        }
        
        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'updateView' && data.script) {
              eval(data.script);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initMap);
        
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={`map-${services.length}`}
        source={{ html: htmlContent }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleMessage}
        allowsInlineMediaPlayback={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading interactive map...</Text>
          </View>
        )}
      />
      
      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        {/* Show All Services Button */}
        <TouchableOpacity
          style={styles.showAllButton}
          onPress={handleShowAllServices}
        >
          <Ionicons name="apps" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Locate Me Button */}
        <TouchableOpacity
          style={styles.locateButton}
          onPress={handleLocateUser}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="locate" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Category Legend */}
      {showCategoryLegend && categoryStats.length > 0 && onCategoryToggle && (
        <MapCategoryLegend
          categoryStats={categoryStats}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          position="top-right"
          collapsible={true}
        />
      )}

      {/* Services Count Badge */}
      {filteredServices.length > 0 && (
        <View style={styles.servicesBadge}>
          <Text style={styles.servicesBadgeText}>
            {filteredServices.length} facilities
            {selectedCategories.length > 0 && ` (filtered)`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  controlButtons: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  showAllButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  servicesBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: Colors.primary + 'CC',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  servicesBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});