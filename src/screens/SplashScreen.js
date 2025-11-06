import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, StatusBar } from 'react-native';
import { Audio } from 'expo-av'; // ✅ IMPORTAÇÃO CORRETA
import {LinearGradient} from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(200)).current;
useEffect(() => {
  let soundObject;

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/SoundsEdit.mp3')
      );
      soundObject = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Erro ao carregar/tocar som:', error);
    }
  };

  playSound();

  // animação de entrada
  Animated.parallel([
    Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 1200, useNativeDriver: true })
  ]).start();

  // simula carregamento de recursos
  const timer = setTimeout(() => {
    navigation.replace('Login');
  }, 4000);

  return () => {
    clearTimeout(timer);
    // libera o player de áudio
    if (soundObject) {
      soundObject.stopAsync();
      soundObject.unloadAsync();
    }
  };
}, [navigation]);

  return (
    <LinearGradient colors={["#ffffffff", "#ffffffff", "#ffffffe0"]} style={{ flex: 1 }}>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.center, { opacity: fade, transform: [{ translateY }] }]}>
        <Image source={require('../../assets/tugacriança.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={{ fontWeight: 'bold' }}>MY</Text> <Text style={{ color: '#00aaff' }}>GLUCO</Text>
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.brand}>Mindsync</Text>
        <Text style={styles.brandSub}>Company's</Text>
      </View>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 200
  },
  center: { alignItems: 'center' },
  logo: { width: 160, height: 160, marginBottom: 12 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.06)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 220
  },
  footer: { alignItems: 'center' },
  brand: { fontSize: 25, fontWeight: '700', color: '#111' },
  brandSub: { fontSize: 18, color: '#1a9e55', marginTop: 1, fontWeight: 'bold' }
});
