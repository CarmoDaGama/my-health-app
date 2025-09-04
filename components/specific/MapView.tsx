import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';
import { HealthService, Coordinates, Region } from '../../types';

interface MapViewProps {
  region: Region;
  services: HealthService[];
  userLocation?: Coordinates;
  onServicePress?: (service: HealthService) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  region,
  services,
  userLocation,
  onServicePress,
}) => {
  const webViewRef = useRef<WebView>(null);

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
        
        // Adicionar marcadores dos serviços
        const services = ${JSON.stringify(services)};
        
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
            .addTo(map)
            .bindPopup(\`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #2E7D32;">\${service.name}</h3>
                <p style="margin: 0 0 8px 0; font-weight: 500;">\${service.type}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">\${service.address}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">\${service.description}</p>
              </div>
            \`);
            
          marker.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'servicePress',
              service: service
            }));
          });
        });
        
        // Ajustar view para mostrar todos os marcadores
        if (services.length > 0) {
          const group = new L.featureGroup(map._layers);
          if (Object.keys(group._layers).length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
          }
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'servicePress' && onServicePress) {
        onServicePress(data.service);
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
      />
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
});
