import React, { useRef, useEffect, useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, Text } from 'react-native';
import { HealthService, Coordinates, Region } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface MapViewProps {
  region: Region;
  services: HealthService[];
  userLocation?: Coordinates;
  onServicePress?: (service: HealthService) => void;
  maxServicesToShow?: number;
  clusteringEnabled?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  region,
  services,
  userLocation,
  onServicePress,
  maxServicesToShow = 50,
  clusteringEnabled = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { t } = useTranslation();

  // Otimização: limitar número de serviços e ordenar por proximidade se houver localização do usuário
  const optimizedServices = useMemo(() => {
    if (!services || !Array.isArray(services)) {
      return [];
    }
    let processedServices = [...services];

    // Se há localização do usuário, ordenar por distância
    if (userLocation) {
      processedServices = processedServices.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.coordinates.latitude,
          a.coordinates.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.coordinates.latitude,
          b.coordinates.longitude
        );
        return distanceA - distanceB;
      });
    }

    // Limitar número de serviços para performance
    return processedServices.slice(0, maxServicesToShow);
  }, [services, userLocation, maxServicesToShow]);

  // Função para calcular distância
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getServiceIcon = (type: string) => {
    const icons = {
      hospital: '🏥',
      clinic: '🏩', 
      pharmacy: '💊',
      emergency: '🚑',
      laboratory: '🔬',
    };
    return icons[type as keyof typeof icons] || '🏥';
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-marker {
          background: white;
          border: 2px solid #2E7D32;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .user-marker {
          background: #2196F3;
          border: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
      <script>
        // Inicializar mapa
        const map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
        
        // Adicionar tile layer do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Adicionar marcador do usuário se disponível
        ${userLocation ? `
          const userIcon = L.divIcon({
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
            .addTo(map)
            .bindPopup('Sua localização');
        ` : ''}
        
        // Preparar serviços para exibição (otimizados)
        const services = ${JSON.stringify(optimizedServices)};
        
        // Criar grupo de clusters se habilitado
        ${clusteringEnabled ? `
        const markers = L.markerClusterGroup({
          maxClusterRadius: 50,
          iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: '<div style="background: #2E7D32; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">' + count + '</div>',
              className: 'custom-cluster-icon',
              iconSize: L.point(30, 30)
            });
          }
        });
        ` : ''}
        
        services.forEach(service => {
          const serviceIcons = {
            hospital: '🏥',
            clinic: '🏩', 
            pharmacy: '💊',
            emergency: '🚑',
            laboratory: '🔬',
          };
          
          const icon = L.divIcon({
            className: 'custom-marker',
            html: serviceIcons[service.type] || '🏥',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });
          
          const marker = L.marker([service.coordinates.latitude, service.coordinates.longitude], {icon: icon})
            .bindPopup(\`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #2E7D32;">\${service.name}</h3>
                <p style="margin: 0 0 8px 0; font-weight: 500;">\${service.type}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">\${service.address}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">\${service.description || ''}</p>
              </div>
            \`);
            
          marker.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'servicePress',
              service: service
            }));
          });

          // Adicionar ao grupo de clusters ou diretamente ao mapa
          ${clusteringEnabled ? `markers.addLayer(marker);` : `marker.addTo(map);`}
        });
        
        // Adicionar grupo de clusters ao mapa se habilitado
        ${clusteringEnabled ? `map.addLayer(markers);` : ''}
        
        // Ajustar view para mostrar todos os marcadores
        if (services.length > 0) {
          ${clusteringEnabled ? `
          if (markers.getLayers().length > 0) {
            map.fitBounds(markers.getBounds().pad(0.1));
          }
          ` : `
          const group = new L.featureGroup(map._layers);
          if (Object.keys(group._layers).length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
          }
          `}
        }

        // Notificar que o mapa está pronto
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapReady'
        }));
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'servicePress' && onServicePress) {
        onServicePress(data.service);
      } else if (data.type === 'mapReady') {
        setIsMapReady(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onLoadEnd={() => setIsMapReady(true)}
      />
      {!isMapReady && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>{t('map.loading')}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2E7D32',
    borderTopColor: 'transparent',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
