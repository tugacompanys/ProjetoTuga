import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Vibration,
  ScrollView,
  Image,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useNavigation } from '@react-navigation/native';
import { Modal } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowSound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let soundObject = null;

async function tocarAlarme() {
  try {
    if (soundObject) return;
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/alarme.wav"),
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    soundObject = sound;
  } catch (error) {
    console.log("Erro ao tocar alarme:", error);
  }
}

async function pararAlarme() {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    }
  } catch (error) {
    console.log("Erro ao parar alarme:", error);
  }
}

const startVibration = () => {
  Vibration.vibrate([500, 500], true);
};

const stopVibration = () => {
  Vibration.cancel();
};

export default function RegistroMedicamentoScreen() {
  const [medicamento, setMedicamento] = useState("");
  const [horario, setHorario] = useState(new Date());
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [horarioManual, setHorarioManual] = useState("");

  const [medicamentos, setMedicamentos] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [alarmeVisivel, setAlarmeVisivel] = useState(false);
  const [medicamentoAtual, setMedicamentoAtual] = useState(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeLoop = useRef(null);
  const ultimoAlarmeRef = useRef(null);
  const navigation = useNavigation();

  const horariosRapidos = ["06:00", "08:00", "12:00", "18:00", "22:00"];

  const formatarHorario = (text) => {
    let cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    if (cleaned.length > 2) {
      cleaned = cleaned.replace(/(\d{2})(\d)/, "$1:$2");
    }
    setHorarioManual(cleaned);
  };

  const startShake = () => {
    shakeAnim.setValue(0);

    shakeLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ])
    );

    shakeLoop.current.start();
  };


  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("@meds");
      const historic = await AsyncStorage.getItem("@historico");

      if (data) setMedicamentos(JSON.parse(data));
      if (historic) setHistorico(JSON.parse(historic));

      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@meds", JSON.stringify(medicamentos));
  }, [medicamentos]);

  useEffect(() => {
    AsyncStorage.setItem("@historico", JSON.stringify(historico));
  }, [historico]);

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = new Date();
      const horaAtual = agora.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      medicamentos.forEach((m) => {
        if (!m.horarios) return;

        m.horarios.forEach((hora) => {
          if (
            hora === horaAtual &&
            !alarmeVisivel &&
            ultimoAlarmeRef.current !== `${m.nome}-${hora}`
          ) {
            ultimoAlarmeRef.current = `${m.nome}-${hora}`;
            setMedicamentoAtual({ ...m, hora });
            setAlarmeVisivel(true);
            startShake();
            tocarAlarme();
            startVibration();
          }
        });
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [medicamentos, alarmeVisivel]);

  const adicionarHorario = () => {
    let novoHorario = null;

    if (/^\d{2}:\d{2}$/.test(horarioManual)) {
      novoHorario = horarioManual;
    } else {
      novoHorario = horario.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (horariosSelecionados.includes(novoHorario)) {
      Alert.alert("Esse horário já foi adicionado.");
      return;
    }

    setHorariosSelecionados([...horariosSelecionados, novoHorario]);
    setHorarioManual("");
  };

  async function agendarNotificacao() {
    if (!medicamento) return Alert.alert("Digite o nome do medicamento.");
    if (horariosSelecionados.length === 0) return Alert.alert("Adicione um horário.");

    for (let h of horariosSelecionados) {
      const [hora, minuto] = h.split(":").map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Hora do medicamento",
          body: `Tomar: ${medicamento}`,
        },
        trigger: { hour: hora, minute: minuto, repeats: true },
      });
    }

    const novo = {
      id: Date.now().toString(),
      nome: medicamento,
      horarios: horariosSelecionados,
    };

    setMedicamentos([...medicamentos, novo]);
    setHorariosSelecionados([]);
    setMedicamento("");

    Alert.alert("✅ Alarme criado!");
  }

  const registrarHistorico = (status) => {
    if (!medicamentoAtual) return;

    const novoRegistro = {
      id: Date.now().toString(),
      nome: medicamentoAtual.nome,
      hora: medicamentoAtual.hora,
      status, // "tomado", "atrasado", "nao_tomado"
      data: new Date().toLocaleDateString(),
    };

    setHistorico((prev) => [novoRegistro, ...prev]);

    pararAlarme();
    stopVibration();
    if (shakeLoop.current) {
      shakeLoop.current.stop();
      shakeLoop.current = null;
    }
    setAlarmeVisivel(false);
    setMedicamentoAtual(null);
  };


  useEffect(() => {
    if (alarmeVisivel) {
      const timer = setTimeout(() => {
        if (alarmeVisivel) {
          registrarHistorico("nao_tomado"); // vermelho automático
        }
      }, 300000); // 5 minutos

      return () => clearTimeout(timer);
    }
  }, [alarmeVisivel]);


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#007AFF" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>


      {/* ===== TOPO ===== */}
      <View style={styles.topo}>
        <Text style={styles.titulo}>Agenda de Medicamentos</Text>

        <Image
          source={require("../../assets/remedio.png")}
          style={styles.imagemTopo}
        />

        <Text style={styles.descricao}>
          Nessa tela você poderá adicionar um medicamento e salvar como lembrete
          para não perder o horário das suas prescrições médicas.
        </Text>
      </View>

      {/* ===== CARD DE CADASTRO ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Nome do Medicamento</Text>
        <TextInput
          style={styles.input}
          placeholder="ex. Espironolactona..."
          value={medicamento}
          onChangeText={setMedicamento}
        />

        <Text style={styles.label}>Digite o horário</Text>
        <TextInput
          style={styles.inputHorario}
          placeholder="HH:MM"
          keyboardType="number-pad"
          maxLength={5}
          value={horarioManual}
          onChangeText={formatarHorario}
        />

        <TouchableOpacity
          style={styles.botaoAzul}
          onPress={() => setMostrarPicker(true)}
        >
          <Text style={styles.btnText}>Abrir relógio ⏱️</Text>
        </TouchableOpacity>

        {mostrarPicker && (
          <DateTimePicker
            value={horario}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || horario;
              setMostrarPicker(false);
              setHorario(currentDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.botaoVerde} onPress={adicionarHorario}>
          <Text style={styles.btnText}>Adicionar horário +</Text>
        </TouchableOpacity>
      </View>

      {/* ===== HORÁRIOS + MASCOTE ===== */}
      <View style={styles.horariosBox}>
        <Text style={styles.subtitulo}>⏱ Horários Adicionados:</Text>

        {horariosSelecionados.length === 0 && (
          <Text style={{ color: "#555" }}>Nenhum horário ainda</Text>
        )}

        {horariosSelecionados.map((h) => (
          <Text key={h} style={styles.horarioItem}>• {h}</Text>
        ))}

        {/* MASCOTE (NÃO CORTA) */}
        <Image
          source={require("../../assets/tuga_prancheta.png")}
          style={styles.mascoteDireita}
        />
      </View>

      {/* BOTÃO CONFIRMAR */}
      <TouchableOpacity
        style={styles.botaoConfirmar}
        onPress={agendarNotificacao}
      >
        <Text style={styles.btnText}>✅ Confirmar Alarme</Text>
      </TouchableOpacity>

      {/* ===== HISTÓRICO ===== */}
      <View style={styles.historicoBox}>
        <Text style={styles.subtitulo}>📋 Histórico</Text>

        {historico.length === 0 && (
          <Text style={{ color: "#555" }}>Nenhum registro ainda</Text>
        )}

        {historico.map((h) => (
          <Text
            key={h.id}
            style={{
              marginBottom: 4,
              color:
                h.status === "tomado"
                  ? "green"
                  : h.status === "atrasado"
                    ? "#eab308"
                    : "red",
            }}
          >
            💊 {h.nome} — ⏰ {h.hora}
          </Text>
        ))}
      </View>


      {/* ===== MODAL DO ALARME (mantém igual) ===== */}
      <Modal visible={alarmeVisivel} transparent animationType="slide">
        <View style={styles.modalBg}>
          <Animated.View
            style={[
              styles.modalBox,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            <Text style={styles.modalTitulo}>⏰ Hora do medicamento</Text>

            {medicamentoAtual && (
              <Text style={styles.modalTexto}>
                {medicamentoAtual.nome} — {medicamentoAtual.hora}
              </Text>
            )}

            <TouchableOpacity
              style={styles.btnTomado}
              onPress={() => registrarHistorico("tomado")}
            >
              <Text style={styles.btnText}>✅ Tomei</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnAtrasado}
              onPress={() => registrarHistorico("atrasado")}
            >
              <Text style={styles.btnText}>⚠️ Tomei com atraso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnNaoTomado}
              onPress={() => registrarHistorico("nao_tomado")}
            >
              <Text style={styles.btnText}>❌ Não tomei</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: -8,
    marginTop: 18
  },
  backText: {
    color: "#007AFF",
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6
  },

  titulo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#007AFF",
    textAlign: "center",
    marginVertical: 10
  },

  topo: {
    alignItems: "center",
    marginBottom: 10
  },

  imagemTopo: {
    width: 140,
    height: 80,
    resizeMode: "contain",
    marginBottom: 8
  },

  horariosBox: {
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    marginBottom: 10,
    position: "relative",
    overflow: "visible"  // IMPORTANTE: não corta a imagem
  },

  mascoteDireita: {
    width: 140,
    height: 140,
    position: "absolute",
    right: -10,
    bottom: -20,
    resizeMode: "contain",   // NÃO CORTA
    transform: [{ scaleX: -1 }]
  },

  historicoBox: {
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    minHeight: 100,
    padding: 16,
    marginTop: 10
  },
  descricao: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 14,
    color: "#444"
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    elevation: 2
  },

  label: {
    fontWeight: "600",
    marginBottom: 6
  },

  input: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },

  inputHorario: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 12,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10
  },

  botaoAzul: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8
  },

  botaoVerde: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 12,
    alignItems: "center"
  },

  horariosBox: {
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    padding: 10,
    minHeight: 80,
    marginBottom: 10
  },

  mascoteDireita: {
    width: 125,
    height: 125,
    position: "absolute",
    right: -5,
    bottom: -18,
    resizeMode: "contain",   // ← ISSO EVITA CORTAR
    transform: [{ scaleX: -1 }] // ← DESVIRA A IMAGEM (espelho corrigido)
  },


  botaoConfirmar: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 10
  },

  subtitulo: {
    fontWeight: "800",
    marginBottom: 6
  },

  horarioItem: {
    marginLeft: 10
  },

  historicoBox: {
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    minHeight: 80,
    padding: 10,
    marginBottom: 30
  },

  btnText: {
    color: "#fff",
    fontWeight: "700"
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalTexto: {
    fontSize: 16,
    marginBottom: 20,
  },

  btnTomado: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },

  btnAtrasado: {
    backgroundColor: "#eab308",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },

  btnNaoTomado: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
});
