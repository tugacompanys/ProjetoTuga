import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  ImageBackground,
  StatusBar,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Ellipse, Polygon } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BALLOONS_COUNT = 15;

// Objetivos do dia
const objetivosPorDia = [
  "O primeiro passo é acordar o corpo! O treino de cardio leve serve para ativar a circulação, estimular o metabolismo e ajudar a glicose a entrar nas células de forma natural, através do movimento. Caminhar, marchar e fazer passos simples melhora a função cardiovascular sem sobrecarregar o coração. Começar o dia com esse tipo de exercício faz com que o corpo use melhor a insulina e reduza o açúcar no sangue ao longo do dia. Além disso, melhora o humor, o foco e dá aquela sensação de energia renovada para seguir firme na rotina!",
  "Hoje é dia de fortalecer o corpo e o metabolismo! Exercícios de força ajudam o corpo a ganhar massa muscular, e isso é fundamental para quem tem diabetes, pois os músculos consomem glicose mesmo em repouso. Ao treinar força, você melhora a postura, o equilíbrio e reduz o risco de resistência à insulina. Além disso, o treino de força traz mais disposição para o dia a dia e ajuda a controlar o peso corporal de forma saudável. Lembre-se: não é sobre levantar muito peso, e sim sobre movimentar o corpo com consciência e regularidade.",
  "Depois de dois dias de treinos, o foco agora é soltar o corpo e recuperar os músculos. Alongar e trabalhar a mobilidade ajuda a melhorar a flexibilidade, reduzir tensões musculares e melhorar a circulação sanguínea — algo essencial para quem tem diabetes. Esses exercícios leves também ajudam na respiração, diminuem o estresse e equilibram o sistema nervoso, o que contribui diretamente para o controle da glicemia. É um dia para cuidar de si com calma, ouvindo o corpo e respeitando o ritmo.",
  "Agora o corpo já está preparado para um estímulo um pouco mais intenso. O cardio moderado ajuda a melhorar o condicionamento físico, aumentar o gasto calórico e fortalecer o coração. Esse tipo de treino é excelente para melhorar a sensibilidade à insulina e ajudar o organismo a controlar os níveis de açúcar no sangue por mais tempo. Movimentos simples, como caminhada rápida, corrida leve ou step lateral, fazem o corpo trabalhar de forma segura e eficaz. É o dia de sentir o coração bater mais forte — mas sempre com segurança e atenção aos sinais do corpo.",
  "O foco de hoje é trabalhar a estabilidade e o controle do corpo. Exercícios de equilíbrio fortalecem músculos estabilizadores e articulações, ajudando a prevenir quedas, dores e lesões — algo especialmente importante para pessoas com diabetes, que podem ter menor sensibilidade nos pés. Esses movimentos também melhoram a coordenação e o foco mental. Ao unir força e equilíbrio, você ensina o corpo a se mover de forma mais inteligente, segura e eficiente. É um treino para o corpo e para o cérebro!",
  "Após uma semana intensa, o corpo merece um estímulo mais suave. O objetivo aqui é manter o movimento sem forçar, ajudar na recuperação muscular e reduzir o estresse — que é um dos maiores inimigos do controle glicêmico. Caminhadas leves, passos laterais e respiração consciente ajudam a melhorar a oxigenação, acalmar a mente e regular os hormônios ligados ao estresse. Esse tipo de treino é perfeito para fechar a semana com sensação de bem-estar, corpo leve e mente tranquila.",
  "O descanso também faz parte do progresso. Hoje é dia de dar tempo ao corpo para se recuperar, pois é durante o repouso que os músculos se fortalecem e o metabolismo se equilibra. Movimentos leves, como alongar, caminhar devagar e respirar profundamente, mantêm o corpo ativo sem exigir esforço. O descanso ativo ajuda a reduzir a fadiga, melhora o humor e prepara o corpo para uma nova semana de evolução. É o momento de agradecer pelo esforço da semana e se preparar para continuar a jornada com ainda mais saúde e equilíbrio."
];
// Logo abaixo de objetivosPorDia
const infoPorDia = [
  { min: "40 min", exercicios: 5, pontos: 170 }, // domingo
  { min: "35 min", exercicios: 5, pontos: 200 }, // segunda
  { min: "25 min", exercicios: 5, pontos: 90 }, // terça
  { min: "40 min", exercicios: 5, pontos: 240 }, // quarta
  { min: "30 min", exercicios: 5, pontos: 180 }, // quinta
  { min: "35 min", exercicios: 5, pontos: 150 }, // sexta
  { min: "40 min", exercicios: 5, pontos: 90 }  // sábado
];

// No topo do arquivo, logo após os outros imports:
const imagensPorDia = [
  require('../../assets/carlitos_esteira.jpeg'),     
  require('../../assets/carlitos_puxador_de_ferro.jpeg'),   
  require('../../assets/carlitos_com_alagador.jpeg'),    
  require('../../assets/carlitos_correndo.jpeg'),   
  require('../../assets/carlitos_corda.jpeg'),   
  require('../../assets/carlitos_barra.jpeg'),   
  require('../../assets/carlitos_descansando.jpeg'),   
];


const ExercicioPorDia = [
  { TituloExercio: "Cardio Leve", topico: "Corrida" }, // domingo
  { TituloExercio: "Força corpo inteiro", topico: "Força" }, // domingo
  { TituloExercio: "Alongamento e mobilidade", topico: "Alongamento" }, // domingo
  { TituloExercio: "Cardio moderado", topico: "Corrida" }, // domingo
  { TituloExercio: "Força e equilíbrio", topico: "Força" }, // domingo
  { TituloExercio: "Força leve e alongamento", topico: "Força" }, // domingo
  { TituloExercio: "Descanso ativo", topico: "Descanso" }, // domingo

];

const ExpandableText = ({ text, previewLength = 120 }) => {
  const [expanded, setExpanded] = useState(false);
  const textoExibido =
    expanded ? text : text.slice(0, previewLength) + (text.length > previewLength ? '...' : '');

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 14, color: '#333', textAlign: 'justify' }}>{textoExibido}</Text>
      {text.length > previewLength && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={{ color: '#0066cc', fontWeight: 'bold', marginTop: 5 }}>
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ConfeteExplosao = ({ lado }) => {
  const startX = lado === 'esquerda' ? 50 : SCREEN_WIDTH - 50;
  const startY = SCREEN_HEIGHT - 50;

  return Array.from({ length: 15 }).map((_, i) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const angle = Math.random() * Math.PI / 2 - Math.PI / 4;
      const distanceX = Math.cos(angle) * (100 + Math.random() * 100) * (lado === 'esquerda' ? 1 : -1);
      const distanceY = - (150 + Math.random() * 100);
      const fallY = 200 + Math.random() * 100;

      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: distanceX,
            duration: 800 + Math.random() * 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: distanceY,
            duration: 800 + Math.random() * 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(rotate, {
            toValue: 360,
            duration: 1000 + Math.random() * 500,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ]),
        Animated.timing(translateY, {
          toValue: distanceY + fallY,
          duration: 1200 + Math.random() * 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        })
      ]).start();
    }, []);

    const rotateInterpolate = rotate.interpolate({
      inputRange: [0, 360],
      outputRange: ['0deg', '360deg']
    });

    return (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          width: 8 + Math.random() * 6,
          height: 8 + Math.random() * 6,
          backgroundColor: ['#FF0000','#00FF00','#0000FF','#FFFF00','#FF00FF'][Math.floor(Math.random()*5)],
          borderRadius: 3,
          left: startX,
          top: startY,
          transform: [{ translateX }, { translateY }, { rotate: rotateInterpolate }]
        }}
      />
    );
  });
};

export function ModalExercicio({ visible, onClose, index }) {
  const [videoExpandidoId, setVideoExpandidoId] = useState(null);
  const [feito, setFeito] = useState({});
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [diasLiberados, setDiasLiberados] = useState([]);
  const [mostrarParabens, setMostrarParabens] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [parabensBalloons, setParabensBalloons] = useState([]);
  const leftConfettiRef = useRef(null);
  const rightConfettiRef = useRef(null);
  const balloonCount = BALLOONS_COUNT;

  useEffect(() => {
    const hoje = new Date().getDay();
    setDiasLiberados([hoje]);
  }, []);

  useEffect(() => {
    const carregarFeitos = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@videosFeitos');
        if (jsonValue != null) setFeito(JSON.parse(jsonValue));
      } catch (e) { console.error(e); }
    };
    carregarFeitos();
  }, []);

  const salvarFeito = async (novoFeito) => {
    try {
      await AsyncStorage.setItem('@videosFeitos', JSON.stringify(novoFeito));
      verificarParabens(novoFeito);
    } catch (e) { console.error(e); }
  };

  const fecharAviso = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setMostrarAviso(false));
  };

  const getVideoId = url => {
    if (!url) return '';
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch && vMatch[1]) return vMatch[1];
    const embedMatch = url.match(/\/embed\/([^?&/]+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  };

  const abrirOuExpandir = (id, url, diaIndex) => {
    const liberado = diasLiberados.includes(diaIndex);
    if (videoExpandidoId === id) {
      if (liberado) {
        Linking.openURL(url);
        const novoFeito = { ...feito, [id]: true };
        setFeito(novoFeito);
        salvarFeito(novoFeito);
      }
      setVideoExpandidoId(null);
    } else {
      setVideoExpandidoId(id);
    }
  };

  const renderVideoComTexto = (id, titulo, subtitulo, urlEmbed, urlAbrir, diaIndex, ultimo = false) => {
    const videoId = getVideoId(urlAbrir);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    const estaExpandido = videoExpandidoId === id;
    const estaFeito = feito[id] === true;
    const liberado = diasLiberados.includes(diaIndex);
    const diaPassadoNaoFeito = diaIndex < index && !estaFeito;

    return (
      <View key={id}>
        <View
          style={[styles.videoWrapper, {
            flexDirection: estaExpandido ? 'column' : 'row',
            alignItems: estaExpandido ? 'center' : 'flex-start',
            backgroundColor: diaPassadoNaoFeito ? '#ffcccc42' : '#e4e4e4'
          }]}
        >
          <TouchableOpacity
            style={[styles.videoContainer, { height: estaExpandido ? 200 : 85, width: estaExpandido ? '100%' : 150 }]}
            onPress={() => abrirOuExpandir(id, urlAbrir, diaIndex)}
            activeOpacity={0.9}
          >
            {estaExpandido ? (
              <WebView source={{ uri: urlEmbed }} style={{ flex: 1 }} allowsFullscreenVideo scrollEnabled={false} />
            ) : thumbnailUrl ? (
              <ImageBackground source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover">
                {!liberado && (
                  <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Bloqueado</Text>
                  </View>
                )}
              </ImageBackground>
            ) : (<View style={{ flex: 1, backgroundColor: '#000' }} />)}
          </TouchableOpacity>

          {estaExpandido ? (
            <View style={{ width: '100%', marginTop: 10, alignItems: 'center' }}>
              <Text style={styles.tituloVideo}>{titulo}</Text>
              <Text style={styles.subtituloVideo}>
                {subtitulo.split(/(\d+\s?min|\d+s|\d+)/gi).map((palavra, index) => {
                  const azul = /^(\d+s|\d+\s?min|\d+)$/.test(palavra);
                  return (<Text key={index} style={azul ? { color: '#30A7FE', fontWeight: 'bold' } : {}}>{palavra}</Text>);
                })}
              </Text>
              {!liberado && <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 5 }}>Vídeo ainda não liberado</Text>}
            </View>
          ) : (
            <View style={styles.textoContainer}>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.tituloVideo}>{titulo}</Text>
                <Text style={styles.subtituloVideo}>
                  {subtitulo.split(/(\d+\s?min|\d+s|\d+)/gi).map((palavra, index) => {
                    const azul = /^(\d+s|\d+\s?min|\d+)$/.test(palavra);
                    return (<Text key={index} style={azul ? { color: '#30A7FE', fontWeight: 'bold' } : {}}>{palavra}</Text>);
                  })}
                </Text>
              </View>
              <View style={[styles.circuloStatus, { borderColor: estaFeito ? '#00C851' : diaPassadoNaoFeito ? '#ff0000' : '#999' }]}>
                {estaFeito ? <Text style={{ color: '#00C851', fontWeight: 'bold' }}>✓</Text> :
                  diaPassadoNaoFeito ? <Text style={{ color: 'red', fontWeight: 'bold' }}>!</Text> :
                    <View style={styles.pontoStatus} />}
              </View>
            </View>
          )}
        </View>
        {!ultimo && <View style={styles.divisor} />}
      </View>
    );
  };

  const verificarParabens = (novoFeito) => {
    const videosPorDia = [
      ['dom1','dom2','dom3','dom4','dom5'],
      ['seg1','seg2','seg3','seg4','seg5'],
      ['ter1','ter2','ter3','ter4','ter5'],
      ['qua1','qua2','qua3','qua4','qua5'],
      ['qui1','qui2','qui3','qui4','qui5'],
      ['sex1','sex2','sex3','sex4','sex5'],
      ['sab1','sab2','sab3','sab4','sab5']
    ];

    const todosFeitos = videosPorDia[index].every(id => novoFeito[id] === true);
    if (todosFeitos) setMostrarParabens(true);
  };

  // Todos os vídeos do dia
  const videosPorDia = {
    0: [
      {id:'dom1', titulo:'Caminhada no Lugar', subtitulo:'Duração 10 min', url:'https://www.youtube.com/watch?v=_vUl0hbiV8o'},
      {id:'dom2', titulo:'Polichinelo', subtitulo:'Séries 3x10 | Intervalo 30s', url:'https://www.youtube.com/watch?v=Yj1KX1D7b8Q'},
      {id:'dom3', titulo:'Marcha rápida no lugar', subtitulo:'Séries 3x | Intervalo 30s', url:'https://www.youtube.com/watch?v=nlJ2ZtjAYG0'},
      {id:'dom4', titulo:'Step touch', subtitulo:'Séries 3x12 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd1'},
      {id:'dom5', titulo:'Alongamento leve ', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd2'}
    ],
    1: [
      {id:'seg1', titulo:'Agachamento', subtitulo:'Séries 3x12 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd3'},
      {id:'seg2', titulo:'Flexão de braço ajoelhado', subtitulo:'Séries 3x10 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd4'},
      {id:'seg3', titulo:'Ponte (elevação de quadril)', subtitulo:'Séries 3x15 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd5'},
      {id:'seg4', titulo:'Remada invertida', subtitulo:'Séries 3x12 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd6'},
      {id:'seg5', titulo:'Prancha (cotovelos)', subtitulo:'Séries 3x20s | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd7'}
    ],
    2: [
      {id:'ter1', titulo:'Alongamento de pescoço', subtitulo: 'Séries 2x30s | Intervalo 10s', url:'https://www.youtube.com/watch?v=abcd8'},
      {id:'ter2', titulo:'Alongamento de ombros e braços', subtitulo:'Séries 2x30s | Intervalo 10s', url:'https://www.youtube.com/watch?v=abcd9'},
      {id:'ter3', titulo:'Alongamento de pernas', subtitulo:'Séries 2x30s | Intervalo 10s', url:'https://www.youtube.com/watch?v=abcd10'},
      {id:'ter4', titulo:'Alongamento de costas', subtitulo:'Séries 2x30s | Intervalo 10s', url:'https://www.youtube.com/watch?v=abcd11'},
      {id:'ter5', titulo:'Respiração profunda sentada', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd12'}
    ],
    3: [
      {id:'qua1', titulo:'Caminhada rápida', subtitulo:'Duração 15 min', url:'https://www.youtube.com/watch?v=abcd13'},
      {id:'qua2', titulo:'Polichinelo', subtitulo:'Séries 3x30s | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd14'},
      {id:'qua3', titulo:'Step touch lateral', subtitulo:'Séries 3x1min | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd15'},
      {id:'qua4', titulo:'Corrida no lugar', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd16'},
      {id:'qua5', titulo:'Alongamento final', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd17'}
    ],
    4: [
      {id:'qui1', titulo:'Agachamento com apoio de cadeira', subtitulo:'Séries 3x10 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd18'},
      {id:'qui2', titulo:'Elevação lateral de perna', subtitulo:'Séries 3x12 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd19'},
      {id:'qui3', titulo:'Elevação de calcanhar', subtitulo:'Séries 3x15 | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd20'},
      {id:'qui4', titulo:'Equilíbrio em um pé', subtitulo:'Séries 3x20s  | Intervalo 20s', url:'https://www.youtube.com/watch?v=abcd21'},
      {id:'qui5', titulo:'Prancha lateral apoiada no joelho', subtitulo:'Séries 2x20s | Intervalo 20s', url:'https://www.youtube.com/watch?v=abcd22'}
    ],
    5: [
      {id:'sex1', titulo:'Caminhada leve no lugar', subtitulo:'Duração 15 min', url:'https://www.youtube.com/watch?v=abcd23'},
      {id:'sex2', titulo:'Marcha lateral', subtitulo: 'Séries 3x1min | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd24'},
      {id:'sex3', titulo:'Polichinelo baixo impacto', subtitulo:'Séries 3x30s | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd25'},
      {id:'sex4', titulo:'Step touch', subtitulo:'Séries 3x1min | Intervalo 30s', url:'https://www.youtube.com/watch?v=abcd26'},
      {id:'sex5', titulo:'Alongamento final + respiração', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd27'}
    ],
    6: [
      {id:'sab1', titulo:'Caminhada leve', subtitulo:'Duração 15min', url:'https://www.youtube.com/watch?v=abcd28'},
      {id:'sab2', titulo:'Alongamento geral', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd29'},
      {id:'sab3', titulo:'Mobilidade leve', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd30'},
      {id:'sab4', titulo:'Alongamento', subtitulo:'Séries 3x1min | Intervalo 20s', url:'https://www.youtube.com/watch?v=abcd31'},
      {id:'sab5', titulo:'Postura relaxante deitado', subtitulo:'Duração 5 min', url:'https://www.youtube.com/watch?v=abcd32'}
    ]
  };

  useEffect(() => {
    if (mostrarParabens) {
      const temp = Array.from({ length: balloonCount }, (_, i) => {
        const size = 36 + Math.random() * 48; 
        const startX = Math.random() * (SCREEN_WIDTH - size);
        const y = new Animated.Value(SCREEN_HEIGHT + Math.random() * 80);
        const xWave = new Animated.Value(0);

        Animated.timing(y, {
          toValue: -500,
          duration: 5200 + Math.random() * 3000,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad)
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(xWave, { toValue: 10, duration: 700 + Math.random() * 400, useNativeDriver: true }),
            Animated.timing(xWave, { toValue: -8, duration: 800 + Math.random() * 500, useNativeDriver: true })
          ])
        ).start();

        return {
          id: `pballoon-${Date.now()}-${i}`,
          x: startX,
          y,
          xWave,
          size,
          hue: Math.floor(Math.random() * 360)
        };
      });
      setParabensBalloons(temp);

      setTimeout(() => leftConfettiRef.current?.start(), 80);
      setTimeout(() => rightConfettiRef.current?.start(), 260);
    } else {
      setParabensBalloons([]);
    }
  }, [mostrarParabens]);

  const handleFecharParabens = () => {
    setMostrarParabens(false);
    setParabensBalloons([]);
  };
  // ---------------------------------------------------------------------------

  const renderParabensBalloon = (b) => {
    const size = b.size;
    const balloonHeight = size * 1.2;
    const widthBalloon = size;
    const heightBalloon = balloonHeight;

    return (
      <Animated.View
        key={b.id}
        style={{
          position: 'absolute',
          left: b.x,
          transform: [
            { translateY: b.y },
            { translateX: b.xWave }
          ],
          alignItems: 'center'
        }}
      >
        <Svg width={widthBalloon} height={heightBalloon + 60}>
          <Defs>
            <SvgLinearGradient id={`grad${b.id}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={`hsl(${b.hue}, 80%, 70%)`} />
              <Stop offset="70%" stopColor={`hsl(${b.hue}, 80%, 50%)`} />
              <Stop offset="100%" stopColor={`hsl(${b.hue}, 80%, 45%)`} />
            </SvgLinearGradient>

            <SvgLinearGradient id={`reflex${b.id}`} x1="0.3" y1="0" x2="0.6" y2="0.5">
              <Stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="white" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>


          <Ellipse
            cx={widthBalloon / 2}
            cy={heightBalloon / 2}
            rx={widthBalloon / 2}
            ry={heightBalloon / 2}
            fill={`url(#grad${b.id})`}
          />

          {/* Reflexo */}
          <Ellipse
            cx={widthBalloon / 2}
            cy={heightBalloon / 3}
            rx={widthBalloon / 4}
            ry={heightBalloon / 6}
            fill={`url(#reflex${b.id})`}
          />

          {/* Ponta triangular */}
          <Polygon
            points={`${widthBalloon/2 - widthBalloon/10},${heightBalloon} ${widthBalloon/2 + widthBalloon/10},${heightBalloon} ${widthBalloon/2},${heightBalloon + widthBalloon/5}`}
            fill={`hsl(${b.hue}, 80%, 60%)`}
          />

          {/* Cordinha branca curva */}
          <Path
            d={`M${widthBalloon / 2},${heightBalloon + widthBalloon / 5} q5,15 -5,30 q5,15 -5,30`}
            stroke="#ffffffcc"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ width: SCREEN_WIDTH, height: 250 }}><ImageBackground
  source={imagensPorDia[index]}
  style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 20, paddingHorizontal: 20 }}
  resizeMode="cover"
>
  <LinearGradient
    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,1)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={{ ...StyleSheet.absoluteFillObject }}
  />

  <TouchableOpacity onPress={onClose} style={styles.botaoVoltar}>
    <Ionicons name="arrow-back" size={28} color="black" />
  </TouchableOpacity>

  <View style={styles.infoRow}>
    <View style={{ marginBottom: 10 }}>
      <View style={{ marginBottom: -25}}>
        <Text style={{fontSize: 16, fontWeight: '500', color: '#000000ff', top: 3, left: 3 }}>
          Treino com o Carlitos
        </Text>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#000000ff', top: 3 }}>
          {ExercicioPorDia[index].TituloExercio}
        </Text>
        <Text style={{ fontSize: 18 , color: '#343333ff', left: 3, fontWeight: '500', }}>
          {ExercicioPorDia[index].topico}
        </Text>
      </View>

<View style={styles.infoRow}>
  <View style={styles.infoItem}>
    <Ionicons name="time-outline" size={24} color="#2b9cf9" top={20}  />
    <View style={styles.infoNumberText}>
      <Text style={styles.infoNumber}>{infoPorDia[index].min}</Text>
      <Text style={styles.infoLabel}>Duração</Text>
    </View>
  </View>

  <View style={styles.infoItem}>
    <MaterialCommunityIcons name="weight-lifter" size={24} color="#2b9cf9" top={20}  />
    <View style={styles.infoNumberText}>
      <Text style={styles.infoNumber}>{infoPorDia[index].exercicios}</Text>
      <Text style={styles.infoLabel}>Exercícios</Text>
    </View>
  </View>

  <View style={styles.infoItem}>
    <FontAwesome5 name="fire" size={24 } color="#2b9cf9" top={20} />
    <View style={styles.infoNumberText}>
      <Text style={styles.infoNumber}>{infoPorDia[index].pontos}</Text>
      <Text style={styles.infoLabel}>Calorias</Text>
    </View>
  </View>
</View>

    </View>
  </View>
</ImageBackground>
</View>

          {mostrarAviso && (
            <Animated.View style={[styles.aviso, { opacity: fadeAnim }]}>
              <View style={styles.emojiContainer}><Text style={styles.emoji}>⚠️</Text></View>
              <Text style={styles.TituloAviso}>Observações Importantes</Text>
              <Text style={styles.textoAviso}>
                Pessoas com diabetes devem ter alguns cuidados ao se exercitar. Meça a glicemia antes e depois do treino,
                mantenha-se hidratado e tenha sempre uma fonte de glicose rápida por perto. Caso sinta tontura,
                fraqueza ou tremores, pare imediatamente. Use roupas leves, tênis confortáveis e mantenha a intensidade adequada.
              </Text>
              <View style={styles.botoesAviso}>
                <TouchableOpacity style={[styles.botaoFecharAviso]} onPress={fecharAviso}>
                  <Text style={styles.textoBotaoFechar}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
<View style={{ width: '90%', alignSelf: 'center', marginBottom: 10 }}>
  <Text style={styles.objetivoTitulo}>Objetivo</Text>
  <ExpandableText text={objetivosPorDia[index]} />
</View>



          <View style={styles.MostrarMais}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black', marginTop: 20, marginBottom: -20 }}>Exercícios</Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {videosPorDia[index].map((video, i) => renderVideoComTexto(
              video.id,
              video.titulo,
              video.subtitulo,
              `https://www.youtube.com/embed/${video.url.split('v=')[1]}`,
              video.url,
              index,
              i === videosPorDia[index].length - 1
            ))}
          </View>
        </ScrollView>

        {mostrarParabens && (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>Parabéns!</Text>
            <TouchableOpacity style={{
              backgroundColor: '#fff',
              paddingVertical: 10,
              paddingHorizontal: 25,
              borderRadius: 15,
              marginBottom: 12
            }} onPress={handleFecharParabens}>
              <Text style={{ fontWeight: 'bold', color: '#000' }}>Fechar</Text>
            </TouchableOpacity>

            <ConfettiCannon
              count={40}
              explosionSpeed={420}
              fallSpeed={1800}
              fadeOut={false}
              spread={300}
              origin={{ x: 0, y: 0 }}
              autoStart={false}
              ref={leftConfettiRef}
              style={[styles.confetti, { left: 0, bottom: 0 }]}
            />
            <ConfettiCannon
              count={40}
              explosionSpeed={420}
              fallSpeed={1800}
              fadeOut={false}
              spread={300}
              origin={{ x: SCREEN_WIDTH, y: 0 }}
              autoStart={false}
              ref={rightConfettiRef}
              style={[styles.confetti, { right: 0, bottom: 0 }]}
            />

            {parabensBalloons.map(renderParabensBalloon)}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  videoWrapper: { width: '100%', borderRadius: 10, overflow: 'hidden', marginTop: 10, paddingVertical: 8, paddingHorizontal: 10 },
  videoContainer: { borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  textoContainer: { flex: 1, paddingLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tituloVideo: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  subtituloVideo: { fontSize: 14, color: '#666', marginTop: 4 },
  circuloStatus: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  pontoStatus: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#999' },
  botaoVoltar: { position: 'absolute', top: 50, left: 20 },
  tituloBanner: { color: 'black', fontSize: 30, fontWeight: 'bold', marginBottom: 3 },
  divisor: { alignSelf: 'center', height: 1, width: '90%', backgroundColor: '#bbb', borderRadius: 20, marginVertical: 8 },
  aviso: { width: '90%', backgroundColor: "#FFDD00", alignSelf: 'center', borderRadius: 20, paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20, marginTop: 35, alignItems: 'center', position: 'relative' },
  emojiContainer: { position: 'absolute', top: -40, backgroundColor: '#fff', padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', width: 80 },
  emoji: { fontSize: 40, marginBottom: 3 },
  textoAviso: { fontSize: 14, fontWeight: '300', color: '#333', marginBottom: 15, textAlign: 'justify' },
  botoesAviso: { flexDirection: 'row' },
  botaoFecharAviso: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 15, alignSelf: 'center' },
  textoBotaoFechar: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  TituloAviso: { fontSize: 20, color: 'black', fontWeight: 'bold' },
  MostrarMais: { width: '90%', alignSelf: 'center' },
  container: { flex: 1, backgroundColor: '#4c4c4f' },
  buttonContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 25,
    left: SCREEN_WIDTH / 2 - 60,
    width: 120,
  },
  confetti: { position: 'absolute', bottom: 0 },
  objetivoTitulo: {
  color: '#4A90E2', 
  fontSize: 17,     
  fontWeight: 'bold',
  marginBottom: 4,
  top: 15
},
// ...
infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between', 
  alignItems: 'center',
  width: SCREEN_WIDTH * 0.9,      
  alignSelf: 'center',            
  marginTop: 10,
  right: 2,
},

infoItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',      
},


infoNumberText: {
  marginLeft: 8, 
},

infoNumber: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '',
  top: 20
},
infoLabel: {
  fontSize: 16,
  color: '#666',
  top: 20
},

});
