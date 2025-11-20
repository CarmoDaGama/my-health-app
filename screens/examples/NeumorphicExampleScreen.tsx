/**
 * MENDLINK - Exemplos de Uso dos Componentes Neumórficos
 * 
 * Este arquivo demonstra como usar os novos componentes neumórficos
 * implementados no redesign da interface MENDLINK.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicInput,
} from '../../components';
import { Colors, spacing } from '../../constants';

export const NeumorphicExampleScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MENDLINK Neumorphic Design</Text>
      
      {/* Buttons Examples */}
      <NeumorphicCard style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>
        
        <View style={styles.buttonRow}>
          <NeumorphicButton
            title="Primary"
            variant="primary"
            onPress={() => {}}
          />
          
          <NeumorphicButton
            title="Secondary"
            variant="secondary"
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.buttonRow}>
          <NeumorphicButton
            title="With Icon"
            icon="heart"
            variant="primary"
            onPress={() => {}}
          />
          
          <NeumorphicButton
            icon="search"
            variant="tertiary"
            rounded
            onPress={() => {}}
          />
        </View>
      </NeumorphicCard>

      {/* Cards Examples */}
      <NeumorphicCard style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        
        <NeumorphicCard variant="flat" style={styles.exampleCard}>
          <Text>Flat Card</Text>
        </NeumorphicCard>
        
        <NeumorphicCard variant="elevated" style={styles.exampleCard}>
          <Text>Elevated Card</Text>
        </NeumorphicCard>
        
        <NeumorphicCard variant="pressed" style={styles.exampleCard}>
          <Text>Pressed Card</Text>
        </NeumorphicCard>
      </NeumorphicCard>

      {/* Inputs Examples */}
      <NeumorphicCard style={styles.section}>
        <Text style={styles.sectionTitle}>Inputs</Text>
        
        <NeumorphicInput
          placeholder="Search healthcare services..."
          icon="search"
          style={styles.input}
        />
        
        <NeumorphicInput
          placeholder="Enter your email"
          icon="mail"
          keyboardType="email-address"
          style={styles.input}
        />
        
        <NeumorphicInput
          placeholder="Password"
          icon="lock-closed"
          secureTextEntry
          style={styles.input}
        />
      </NeumorphicCard>

      {/* Interactive Demo */}
      <NeumorphicCard variant="elevated" style={styles.section}>
        <Text style={styles.sectionTitle}>Interactive Demo</Text>
        
        <Text style={styles.description}>
          Healthcare Service Card Example
        </Text>
        
        <NeumorphicCard 
          variant="default" 
          onPress={() => {}}
          style={styles.serviceCard}
        >
          <View style={styles.serviceHeader}>
            <View>
              <Text style={styles.serviceName}>Hospital Central</Text>
              <Text style={styles.serviceType}>Hospital • 2.5 km</Text>
            </View>
            <View style={styles.serviceRating}>
              <Text style={styles.ratingText}>4.8 ⭐</Text>
            </View>
          </View>
          
          <Text style={styles.serviceDescription}>
            Emergency services, surgery, maternity ward
          </Text>
          
          <View style={styles.serviceActions}>
            <NeumorphicButton
              title="Call"
              icon="call"
              variant="secondary"
              size="small"
              onPress={() => {}}
            />
            
            <NeumorphicButton
              title="Directions"
              icon="navigate"
              variant="tertiary"
              size="small"
              onPress={() => {}}
            />
          </View>
        </NeumorphicCard>
      </NeumorphicCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  exampleCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  input: {
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  serviceCard: {
    padding: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});