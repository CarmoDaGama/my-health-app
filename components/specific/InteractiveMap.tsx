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
import { Colors, spacing, borderRadius } from '../../constants';
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
  // Lock to prevent other effects from recentering the map immediately after a manual locate
  const userLocationLockRef = useRef<boolean>(false);
  const USER_LOCATION_LOCK_MS = 10000; // 10 seconds lock
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
        // Set a temporary lock to avoid race conditions where other effects
        // (services update / mapReady) recenter the map immediately after locate
        userLocationLockRef.current = true;
        // Release lock after a short timeout so normal behavior resumes
        if (locateTimeoutRef.current) clearTimeout(locateTimeoutRef.current);
        locateTimeoutRef.current = setTimeout(() => {
          userLocationLockRef.current = false;
          locateTimeoutRef.current = null;
          console.log('🔓 LOCATE ME: location lock released');
        }, USER_LOCATION_LOCK_MS);
        
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
    // Respect temporary lock: if user recently used Locate Me, skip fitting
    if (userLocationLockRef.current) {
      console.log('⚠️ fitToServices skipped due to user location lock');
      return;
    }
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
    // Release any location lock so auto-zoom/fits can operate again
    userLocationLockRef.current = false;
    
    // If user location is available, show services around user location with intelligent zoom
    if (currentUserLocation && filteredServices.length > 0) {
      fitToServicesAroundUser();
    } else {
      fitToServices();
    }
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
          // Only auto-zoom if the user hasn't manually located themselves
          // and the initial auto-zoom hasn't already been performed.
          // This prevents a race where the WebView/map signals ready after
          // the user used "Locate Me" and then the map jumps back to show services.
          if (
            autoZoomToServices &&
            services.length > 0 &&
            !userManuallyLocated &&
            !initialAutoZoomDone &&
            !userLocationActivated
          ) {
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

  const fitToServicesAroundUser = useCallback(() => {
    if (!currentUserLocation || filteredServices.length === 0) return;
    
    console.log('📍 Ajustando mapa para mostrar serviços ao redor do usuário');
    
    // Include user location in the calculation
    const allLats = [
      currentUserLocation.latitude,
      ...filteredServices.map(s => s.coordinates.latitude)
    ];
    const allLngs = [
      currentUserLocation.longitude,
      ...filteredServices.map(s => s.coordinates.longitude)
    ];
    
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);
    
    // Calculate bounds with intelligent padding
    let deltaLat = (maxLat - minLat) * 1.4; // 40% padding for better view
    let deltaLng = (maxLng - minLng) * 1.4;
    
    // Ensure minimum zoom level (not too close)
    const minDelta = 0.005; // Minimum zoom level
    const maxDelta = 0.1;   // Maximum zoom level for "show all services"
    
    deltaLat = Math.max(Math.min(deltaLat, maxDelta), minDelta);
    deltaLng = Math.max(Math.min(deltaLng, maxDelta), minDelta);
    
    // Center should be biased towards user location but include services
    const userWeight = 0.3; // Give more weight to user location
    const servicesWeight = 0.7;
    
    const servicesCenterLat = filteredServices.reduce((sum, s) => sum + s.coordinates.latitude, 0) / filteredServices.length;
    const servicesCenterLng = filteredServices.reduce((sum, s) => sum + s.coordinates.longitude, 0) / filteredServices.length;
    
    const centerLat = (currentUserLocation.latitude * userWeight) + (servicesCenterLat * servicesWeight);
    const centerLng = (currentUserLocation.longitude * userWeight) + (servicesCenterLng * servicesWeight);
    
    const newRegion = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng
    };
    
    console.log('🗺️ Nova região calculada:', {
      center: [centerLat, centerLng],
      delta: [deltaLat, deltaLng],
      userLocation: [currentUserLocation.latitude, currentUserLocation.longitude],
      servicesCount: filteredServices.length
    });
    
    setMapRegion(newRegion);
    updateMapView(newRegion, currentUserLocation);
  }, [currentUserLocation, filteredServices]);

  console.log('🗺️ [InteractiveMap] Services before filtering:', services.length);
  console.log('🗺️ [InteractiveMap] Selected categories:', selectedCategories);
  console.log('🗺️ [InteractiveMap] Services after category filter:', filteredServices.length);
  
  // Debug: verificar se HospGama está nos serviços ANTES da filtragem
  // const hospGamaOriginal = services.find(s => s.name && s.name.includes('HospGama'));
  // if (hospGamaOriginal) {
  //   console.log('✅ [InteractiveMap] HospGama FOUND in original services:', {
  //     id: hospGamaOriginal.id,
  //     name: hospGamaOriginal.name,
  //     // // type: hospGamaOriginal.type,
  //     coordinates: hospGamaOriginal.coordinates
  //   });
    
  //   // Verificar qual categoria seria atribuída ao HospGama
  //   const hospGamaType = hospGamaOriginal.type || 'general';
  //   const { getCategoryByType } = require('../../constants/categories');
  //   const hospGamaCategory = getCategoryByType(hospGamaType);
  //   console.log('🏥 [InteractiveMap] HospGama category info:', {
  //     serviceType: hospGamaType,
  //     categoryId: hospGamaCategory.id,
  //     categoryName: hospGamaCategory.name,
  //     isSelectedForFilter: selectedCategories.includes(hospGamaCategory.id)
  //   });
  // } else {
  //   console.log('❌ [InteractiveMap] HospGama NOT FOUND in original services');
  // }
  
  // // Debug: verificar se HospGama está nos serviços filtrados
  // const hospGama = filteredServices.find(s => s.name && s.name.includes('HospGama'));
  // if (hospGama) {
  //   console.log('🔍 [InteractiveMap] HospGama in filtered services:', {
  //     id: hospGama.id,
  //     name: hospGama.name,
  //     coordinates: hospGama.coordinates
  //   });
  // } else {
  //   console.log('❌ [InteractiveMap] HospGama NOT in filtered services');
  // }

  // Debug: Verificar se HospGama está nos serviços que serão enviados para o WebView
  const hospGamaInFiltered = filteredServices.find(s => s.name && s.name.includes('HospGama'));
  if (hospGamaInFiltered) {
    console.log('✅ [InteractiveMap] HospGama will be sent to WebView:', {
      id: hospGamaInFiltered.id,
      name: hospGamaInFiltered.name,
      coordinates: hospGamaInFiltered.coordinates,
      color: getServiceColorForMap(hospGamaInFiltered),
      icon: getServiceIcon(hospGamaInFiltered.type || 'general')
    });
  } else {
    console.log('❌ [InteractiveMap] HospGama will NOT be sent to WebView');
  }

  const servicesForWebView = filteredServices.map(service => ({
    ...service,
    color: getServiceColorForMap(service),
    icon: getServiceIcon(service.type || 'general')
  }));

  const servicesJSON = JSON.stringify(servicesForWebView);
  console.log(`🗺️ [InteractiveMap] Sending ${servicesForWebView.length} services to WebView`);

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
          
          console.log('🗺️ [WebView] Received services:', services.length);
          
          // Debug: Verificar se HospGama chegou no WebView
          const hospGamaInWebView = services.find(s => s.name && s.name.includes('HospGama'));
          if (hospGamaInWebView) {
            console.log('✅ [WebView] HospGama FOUND in services:', hospGamaInWebView);
          } else {
            console.log('❌ [WebView] HospGama NOT FOUND in services');
            console.log('🔍 [WebView] Available services:', services.map(s => ({name: s.name, type: s.type})).slice(0, 5));
          }
          
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
            // Debug específico para HospGama
            if (service.name && service.name.includes('HospGama')) {
              console.log('🏥 [WebView] Adding HospGama marker:', {
                name: service.name,
                coordinates: service.coordinates,
                hasValidCoords: !!(service.coordinates && service.coordinates.latitude && service.coordinates.longitude)
              });
            }
            
            const icon = getServiceIcon(service.type);
            const color = service.color || '#2E7D32';
            
            // Validar coordenadas antes de criar marker
            if (!service.coordinates || 
                typeof service.coordinates.latitude !== 'number' || 
                typeof service.coordinates.longitude !== 'number' ||
                isNaN(service.coordinates.latitude) || 
                isNaN(service.coordinates.longitude)) {
              console.error('🚫 [WebView] Invalid coordinates for service:', service.name, service.coordinates);
              return; // Pular este serviço
            }
            
            const serviceIcon = L.divIcon({
              className: 'service-marker',
              html: '<div style="background: ' + color + '; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center;">' + icon + '</div>',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });
            
            console.log('📍 [WebView] Creating marker for:', service.name, 'at', service.coordinates.latitude, service.coordinates.longitude);
            
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
        {/* <TouchableOpacity
          style={styles.showAllButton}
          onPress={handleShowAllServices}
        >
          <Ionicons name="apps" size={24} color="white" />
        </TouchableOpacity> */}
        
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
          position="top-left"
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
    bottom: spacing.xxxl + spacing.xl, // 64 + 32 = 96px para evitar sobreposição com a tab bar
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
  },
  showAllButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.round,
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
    width: 52,
    height: 52,
    borderRadius: borderRadius.round,
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
    bottom: spacing.xxxl + spacing.xl, // 64 + 32 = 96px para evitar sobreposição com a tab bar
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