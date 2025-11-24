import React, { use, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(200)).current;

  const pulse = useRef(new Animated.Value(1)).current;

  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let soundObject;

    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/OpenAPP.wav')
        );
        soundObject = sound;
        await sound.playAsync();
      } catch (error) {
        console.log('Erro ao carregar/tocar som:', error);
      }
    };

    playSound();

    // 1️⃣ SUBIDA + FADE IN
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true
      })
    ]).start(() => {

      // 2️⃣ PULSO
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.11,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start(() => {

         // ⏱️ Espera 1 segundo APÓS o pulso
  setTimeout(() => {

        // 3️⃣ LOADING após o pulso
        Animated.loop(
          Animated.stagger(200, [
            Animated.sequence([
              Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            ]),
          ])
        ).start();

          }, 2000); // 👈 ATRASO AQUI (em ms)
      });
    });


    // 4️⃣ NAVEGAÇÃO
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 7000);

    return () => {
      clearTimeout(timer);
      if (soundObject) {
        soundObject.stopAsync();
        soundObject.unloadAsync();
      }
    };
  }, [navigation]);

  return (
    <LinearGradient
      colors={["#ffffffff", "#ffffffff", "#ffffffe0"]}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* LOGO + ANIMAÇÃO */}
        <Animated.View
          style={[
            styles.center,
            {
              opacity: fade,
              transform: [
                { translateY },
                { scale: pulse }
              ]
            }
          ]}
        >
          <Image
            source={require('../../assets/tugacriança.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            <Text style={{ fontWeight: 'bold' }}>MY</Text>{' '}
            <Text style={{ color: '#00aaff' }}>GLUCO</Text>
          </Text>

          {/* LOADING ANIMADO */}
          <View style={styles.loading}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </Animated.View>

        <View style={[styles.footer, { top: 120 }]}>
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

  logo: {
    width: 160,
    height: 160,
    marginBottom: 12
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.06)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 18
  },

  /* LOADING */
  loading: {
    flexDirection: 'row',
    top: 170
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00aaff',
    marginHorizontal: 6
  },

  footer: { alignItems: 'center' },
  brand: { fontSize: 25, fontWeight: '700', color: '#111' },
  brandSub: {
    fontSize: 18,
    color: '#1a9e55',
    margin: 1,
    fontWeight: 'bold'
  }
});
