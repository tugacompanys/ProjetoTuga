import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ModalExercicio } from "./videos_exercicio";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth * 0.9;
const itemHeight = 500;

const CarroselDia = [
  { id: '0', color: '#FFFFFF'},
  { id: '1', color: '#FFFFFF'},
  { id: '2', color: '#FFFFFF'},
  { id: '3', color: '#FFFFFF'},
  { id: '4', color: '#FFFFFF'},
  { id: '5', color: '#FFFFFF'},
  { id: '6', color: '#FFFFFF'},
];

const dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// ---------------- HeartRateBPM com ondas ----------------
const HeartRateBPM = ({ bpm }) => {
  const [waves, setWaves] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const waveCount = 3;
  const waveDuration = 1000;
  const waveInterval = 200;

  const startWave = () => {
    for (let i = 0; i < waveCount; i++) {
      setTimeout(() => {
        const id = new Date().getTime() + Math.random();
        const anim = new Animated.Value(0);
        setWaves(prev => [...prev, { id, anim }]);

        Animated.timing(anim, {
          toValue: 1,
          duration: waveDuration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setWaves(prev => prev.filter(w => w.id !== id));
        });
      }, i * waveInterval);
    }

    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 10000); // 🔥 fecha automaticamente em 2,5s
  };

  return (
    <View style={styles.waveContainer}>
      {waves.map(w => {
        const scale = w.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
        const opacity = w.anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

        return (
          <Animated.View
            key={w.id}
            style={[
              styles.wave,
              { transform: [{ scale }], opacity, borderColor: '#5DE985' }
            ]}
          />
        );
      })}

      <TouchableOpacity onPress={startWave} activeOpacity={0.9}>
        <LinearGradient
          colors={['#8AF7AE','#5DE985']}
          style={styles.BPM}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.BPMHeart}>💚</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.BPMValue}>{bpm}</Text>
            <Text style={{ fontSize: 12, color: 'white', marginLeft: 4 }}>BPM</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Pop-up */}
{showPopup && (
  <View style={styles.popupWrapper}>
    <View style={styles.popupContainer}>
      <Text style={styles.popupText}>
        Esse valor de BPM é só uma estimativa, use como base pra ter uma noção da intensidade, não como número exato.
      </Text>
    </View>
    <View style={styles.popupArrow} />
  </View>
)}

    </View>
  );
};


export default function App() {
  const navigation = useNavigation();
  const hoje = new Date().getDay();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [treinoFeito, setTreinoFeito] = useState(Array(7).fill(false));
  const [ultimaSemana, setUltimaSemana] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const getWeekNumber = (date) => {
    const d = new Date(date.getTime());
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    const yearStart = new Date(d.getFullYear(),0,1);
    return Math.ceil((((d - yearStart)/86400000)+1)/7);
  };

  useEffect(() => {
    const carregarTreinos = async () => {
      try {
        const dados = await AsyncStorage.getItem('@treinoFeito');
        const semanaSalva = await AsyncStorage.getItem('@ultimaSemana');
        const semanaAtual = getWeekNumber(new Date());

        if (semanaSalva && parseInt(semanaSalva) === semanaAtual && dados) {
          setTreinoFeito(JSON.parse(dados));
          setUltimaSemana(semanaAtual);
        } else {
          setTreinoFeito(Array(7).fill(false));
          setUltimaSemana(semanaAtual);
          await AsyncStorage.setItem('@treinoFeito', JSON.stringify(Array(7).fill(false)));
          await AsyncStorage.setItem('@ultimaSemana', semanaAtual.toString());
        }
      } catch (e) {
        console.log('Erro ao carregar treinos:', e);
      }
    };
    carregarTreinos();
  }, []);

  const abrirModal = (index) => {
    setModalIndex(index);
    setModalVisivel(true);
  };

  const iniciarTreino = async (index) => {
    if(index !== hoje) return;

    const copia = [...treinoFeito];
    copia[index] = true;

    setTreinoFeito(copia);
    await AsyncStorage.setItem('@treinoFeito', JSON.stringify(copia));

    abrirModal(index);
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: hoje, animated:true, viewPosition:0.5 });
    },100);
  }, []);

  const exercicioInfo = [
    {nome:'Cardio leve (aeróbico)', diaTexto:'🌙 Domingo', motivacao:'🏋️‍♂️ Partiu treino!', frase:'Dê o seu melhor!', bpm: 105, calorias: 170},
    {nome:'Força de corpo inteiro', diaTexto:'☀️ Segunda-feira', motivacao:'🌟Você consegue!', frase:'Só vai!', bpm: 115, calorias: 200},
    {nome:'Alongamento e mobilidade', diaTexto:'🔥 Terça-feira', motivacao:'⚡ Bora pra cima!', frase:'Sem preguiça!', bpm: 90, calorias: 90},
    {nome:'Cardio moderado', diaTexto:'💪 Quarta-feira', motivacao:'💪 Dá o gás!', frase:'Mostra tua força.', bpm: 125, calorias: 240},
    {nome:'Força e equilíbrio', diaTexto:'🌿 Quinta-feira', motivacao:'🚀 Energia total!', frase:'Acelera!', bpm: 110, calorias: 180},
    {nome:'Força leve e alongamento', diaTexto:'✨ Sexta-feira', motivacao:'🎯 Último gás!', frase:'Detona hoje.', bpm: 100, calorias: 150},
    {nome:'Descanso ativo (recuperação)', diaTexto:'🌺 Sábado', motivacao:'🌞 Dia de brilhar!', frase:'Fecha bem.', bpm: 85, calorias: 90},
  ];

  const itemSpacing = 20;
  const centerOffset = (screenWidth - itemWidth) / 2;

  return (
    <LinearGradient colors={['#31A9FF','#0B58D8']} style={styles.degrade} start={{x:1,y:0}} end={{x:2,y:1}}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('HomeScreen')}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      {/* topo */}
      <View style={styles.topoContainer}>
        <Text style={styles.titulo}>Exercícios</Text>
        <Text style={{color: 'white', margin: -9, marginBottom: 15, marginLeft: 20, fontSize: 15, fontWeight: 'light'}}>
          Foco na saúde - Semana 1
        </Text>
        <View style={styles.diasContainer}>
          {dias.map((dia,index)=>{
            const ativo = index===hoje;
            let indicador = '•';
            if(index<hoje && !treinoFeito[index]) indicador = '✖';
            if(treinoFeito[index]) indicador = '✔';
            return (
              <View key={index} style={{alignItems:'center', marginHorizontal: 6}}>
                <View style={[styles.diaContainer, ativo && styles.diaAtivoContainer]}>
                  <Text style={[styles.diaTexto, ativo && styles.diaAtivoTexto]}>{dia}</Text>
                </View>
                <Text style={styles.indicador}>{indicador}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Círculo indicador */}
      <Animated.View
        style={{
          position: 'absolute',
          top: itemHeight / 2 - 20 - 49,
          left: scrollX.interpolate({
            inputRange: [0, (itemWidth + itemSpacing) * (CarroselDia.length - 1)],
            outputRange: [
              centerOffset,
              centerOffset + (itemWidth + itemSpacing) * (CarroselDia.length - 1) * 0.14,
            ],
            extrapolate: 'clamp',
          }),
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'white',
          opacity: 0.5,
        }}
      />

      {/* FlatList */}
      <View style={{flex: 0.6, position: 'relative', top: -50}}>
        <Animated.FlatList
          ref={flatListRef}
          data={CarroselDia}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item=>item.id}
          contentContainerStyle={{paddingHorizontal:centerOffset}}
          getItemLayout={(data,index)=>({length:itemWidth+itemSpacing, offset:(itemWidth+itemSpacing)*index, index})}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onScrollToIndexFailed={info=>{setTimeout(()=>{flatListRef.current?.scrollToIndex({index:info.index,animated:true})},100)}}
          renderItem={({item,index})=>{
            const info = exercicioInfo[index];
            const isHoje = index===hoje;

            return (
              <View style={[styles.item,{width:itemWidth,height:itemHeight,backgroundColor:item.color}]}>
                <View style={{flexDirection:'column', width: '100%', alignItems:'center'}}>
                  <Text style={{position:'absolute', top:-20, left: index===6 ? 8 : 18, fontSize:25, fontWeight:'bold', color:'#2f3132'}}>{info.nome}</Text>

                  <View style={{flexDirection:'row', marginTop:50, justifyContent:'space-between', width:'90%'}}>
                    <View style={styles.valorPeso}>
                      <Text style={styles.TextoDomingo}>Gasto Calórico:</Text>
                      <View style={{backgroundColor: "white", alignSelf: 'center', width: '85', height: '85', borderRadius: 50}}>
                          <View style={{backgroundColor: "#bce5fe", alignSelf:  'center', width: 70 , height: 70, borderRadius: 50, top: 7.5, justifyContent: 'center', alignItems: 'center'}}>
  <Text style={styles.CaloriaTexto}>{info.calorias} kcal</Text>
</View>

                      </View>
                    </View>
                  
                    <View style={styles.batimento}>
                      <Text style={styles.TextoDomingo}>BPM estimado:</Text>

                      <HeartRateBPM bpm={info.bpm} />

                    </View>
                  </View>

                  <View style={styles.caixaBaixo}>
                    <Text style={{marginTop:-40, marginLeft:8, fontWeight:'bold', fontSize:20}}>{info.diaTexto}</Text>
                    <View>
                      <Image source={info.imagem || require("../../assets/tuga_bodybuilder.png")} style={styles.Tuga1} resizeMode="contain" />
                    </View>
                    <Text style={styles.TextoMotivador}>{info.motivacao}</Text>
                    <Text style={{marginLeft:36, fontSize:13}}>{info.frase}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.botao, {backgroundColor: isHoje ? '#0B58D8' : 'gray'}]}
                  onPress={() => isHoje ? iniciarTreino(index) : abrirModal(index)}
                >
                  <Text style={styles.botaoTexto}>Iniciar treino</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {modalVisivel && (
        <ModalExercicio
          visible={modalVisivel}
          onClose={() => setModalVisivel(false)}
          index={modalIndex}
        />
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  degrade: { flex: 1 },
  topoContainer: { flex: 0.4, justifyContent: 'center', alignSelf: 'center' },
  titulo: { color: 'white', fontSize: 35, marginBottom: 15, fontWeight: 'bold', textAlign: 'left', margin: '-10', marginLeft: 20 },
  diasContainer: { flexDirection: 'row', width: '80%', marginTop: 10, textAlign: 'center' },
  diaContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  diaAtivoContainer: { backgroundColor: 'white' },
  diaTexto: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  diaAtivoTexto: { color: '#0B58D8' },
  indicador: { color: 'white', marginTop: 4, fontSize: 18 },
  exercicios: { flex: 0.6 },
  item: { justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginHorizontal: 10, position: 'relative' },
  botao: { position: 'absolute', bottom: 70, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, alignItems: 'center', marginRight: 150 },
  botaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  valorPeso: { width: 140, height: 120, borderRadius: 10, backgroundColor: '#bce5fe', marginRight: 35 },
  batimento: { width: 140, height: 120, borderRadius: 10, backgroundColor: '#bce5fe' },
  TextoDomingo: { color: '#5c6062ff', fontSize: 15, marginLeft: 10, marginTop: 5, fontWeight: '600' },
  caixaBaixo: { height: 125, width: 315, backgroundColor: '#bce5fe', borderRadius: 25, marginTop: 100 },
  Tuga1: { height: 220, width: undefined, marginTop: -85, marginLeft: 150, marginRight: -23 },
  TextoMotivador:{ fontSize: 18, marginLeft: 10, marginTop: -110, fontWeight: '600', color: '#2f3132ff' },
  BPM: { width: 85, height: 85, borderRadius: 50, alignSelf: 'center', alignItems: 'center', flexDirection: 'column' },
  BPMHeart: { fontSize: 18,},
  BPMValue: { fontSize: 28, fontWeight: 'bold', color: 'white', marginTop: 0 },
  waveContainer: { position:'relative', alignItems:'center', justifyContent:'center', alignSelf: 'center' },
  wave: { position:'absolute', width:50, height:50, borderRadius:45, borderWidth:15 },
  CaloriaTexto: { fontSize: 16, color: '#2f3132', fontWeight: 'bold', textAlign: 'center', alignSelf: 'center' },
popupWrapper: {
  position: 'absolute',
  bottom: 100,          // continua acima do BPM
  alignItems: 'flex-start', // para usar left
  right: 10,             // desloca o pop-up para a esquerda
  zIndex: 10,
},
popupContainer: {
  backgroundColor: 'white',
  paddingVertical: 6,
  paddingHorizontal: 24,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: '#ccc',
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5,
  maxWidth: 260,
  minWidth: 220,
},
popupText: {
  color: '#333',
  fontSize: 13,
  fontWeight: '500',
  textAlign: 'left',
  lineHeight: 16,
},
popupArrow: {
  width: 0,
  height: 0,
  borderLeftWidth: 8,
  borderRightWidth: 8,
  borderBottomWidth: 0,
  borderTopWidth: 8,      // seta para cima
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: 'white',
  marginBottom: -1,
  marginLeft: 180,        // desloca a flecha para a direita dentro do pop-up
},
backButton: {
  position: 'absolute',
  top: 30,      // ajusta conforme o status bar/notch
  left: 20,
  zIndex: 10,
},


});
