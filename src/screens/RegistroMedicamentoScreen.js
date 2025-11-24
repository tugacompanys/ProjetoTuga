import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
  ScrollView,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowSound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let soundObject = null;

// =================== TOCAR ALARME ===================
async function tocarAlarme() {
  try {
    if (soundObject) return;

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/alarme.wav"),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      }
    );

    soundObject = sound;
  } catch (error) {
    console.log("Erro ao tocar alarme:", error);
  }
}

// =================== PARAR ALARME ===================
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

// =================== VIBRAÇÃO ===================
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

  // NOVO → horário digitado
  const [horarioManual, setHorarioManual] = useState("");

  const [medicamentos, setMedicamentos] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [alarmeVisivel, setAlarmeVisivel] = useState(false);
  const [medicamentoAtual, setMedicamentoAtual] = useState(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const ultimoAlarmeRef = useRef(null);

  // Horários rápidos
  const horariosRapidos = ["06:00", "08:00", "12:00", "18:00", "22:00"];

  // ================= ANIMAÇÃO =================
  const startShake = () => {
    shakeAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ])
    ).start();
  };

  // ================= CARREGAR =================
  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("@meds");
      const historic = await AsyncStorage.getItem("@historico");

      if (data) setMedicamentos(JSON.parse(data));
      if (historic) setHistorico(JSON.parse(historic));

      await Notifications.requestPermissionsAsync();
    })();
  }, []);

  // ================= SALVAR =================
  useEffect(() => {
    AsyncStorage.setItem("@meds", JSON.stringify(medicamentos));
  }, [medicamentos]);

  useEffect(() => {
    AsyncStorage.setItem("@historico", JSON.stringify(historico));
  }, [historico]);

  // ================= VERIFICAR ALARME =================
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

  // ================= ADICIONAR HORÁRIO =================
  const adicionarHorario = () => {
    let novoHorario = null;

    // 1️⃣ Se digitou manualmente
    if (/^\d{2}:\d{2}$/.test(horarioManual)) {
      novoHorario = horarioManual;
    } 
    // 2️⃣ Ou usa o DateTimePicker
    else {
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

  // ================= AGENDAR =================
  async function agendarNotificacao() {
    if (!medicamento) {
      Alert.alert("Erro", "Digite o nome do medicamento.");
      return;
    }

    if (horariosSelecionados.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um horário.");
      return;
    }

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

    Alert.alert("✅ Alarme criado", `${novo.nome} às ${novo.horarios.join(", ")}`);
  }

  // ================= HISTÓRICO =================
  const registrarHistorico = (status) => {
    if (!medicamentoAtual) return;

    const novoRegistro = {
      id: Date.now().toString(),
      nome: medicamentoAtual.nome,
      hora: medicamentoAtual.hora,
      status,
      data: new Date().toLocaleDateString(),
    };

    setHistorico((prev) => [novoRegistro, ...prev]);
    pararTudo();
  };

  const pararTudo = async () => {
    await pararAlarme();
    stopVibration();
    setAlarmeVisivel(false);
    setMedicamentoAtual(null);
  };

  const removerMedicamento = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  // ================= RENDER =================
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>💊 Registrar Medicamento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do medicamento / insulina"
        value={medicamento}
        onChangeText={setMedicamento}
      />

      {/* ✅ NOVA FORMA: horário digitado */}
      <Text style={styles.label}>Digite o horário (ex: 07:30)</Text>
      <TextInput 
        mode="time"
        is24Hour={true}
        display="default"
        
        style={styles.input}
        placeholder="HH:MM"
        keyboardType="numeric"
        maxLength={5}
        value={horarioManual}
        onChangeText={setHorarioManual}
      />

      {/* Horários rápidos */}
      <Text style={styles.label}>Ou escolha um rápido:</Text>
      <View style={styles.rapidosContainer}>
        {horariosRapidos.map((hora) => (
          <TouchableOpacity
            key={hora}
            style={styles.horaRapida}
            onPress={() => setHorarioManual(hora)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{hora}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Picker opcional */}
      <TouchableOpacity style={styles.btnSelecionar} onPress={() => setMostrarPicker(true)}>
        <Text style={styles.btnText}>⏰ Abrir relógio</Text>
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

      <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarHorario}>
        <Text style={styles.btnText}>➕ Adicionar horário</Text>
      </TouchableOpacity>

      {horariosSelecionados.map((h) => (
        <View key={h} style={styles.horarioBox}>
          <Text style={styles.horarioTexto}>🕒 {h}</Text>
          <TouchableOpacity onPress={() => setHorariosSelecionados((p) => p.filter((x) => x !== h))}>
            <Text style={{ color: "#dc2626", fontWeight: "bold" }}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.btnConfirmar} onPress={agendarNotificacao}>
        <Text style={styles.btnText}>✅ Agendar Alarme</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>📋 Medicamentos</Text>

      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTexto}>
              💊 {item.nome} - {item.horarios.join(" / ")}
            </Text>

            <TouchableOpacity onPress={() => removerMedicamento(item.id)} style={styles.removerBtn}>
              <Text style={{ color: "white" }}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.subtitulo}>📜 Histórico</Text>

      {historico.map((item) => (
        <View key={item.id} style={styles.historicoItem}>
          <Text style={styles.historicoTexto}>💊 {item.nome}</Text>
          <Text style={styles.historicoTexto}>
            ⏰ {item.hora} - {item.data} - {item.status}
          </Text>
        </View>
      ))}

      {/* MODAL ALARME */}
      <Modal visible={alarmeVisivel} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.modalTitulo}>⏰ Hora do medicamento</Text>

            {medicamentoAtual && (
              <Text style={{ marginBottom: 10 }}>
                {medicamentoAtual.nome} - {medicamentoAtual.hora}
              </Text>
            )}

            <TouchableOpacity style={styles.btnOk} onPress={() => registrarHistorico("Tomado")}>
              <Text style={{ color: "white", fontWeight: "bold" }}>✅ Tomado</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancelar} onPress={pararTudo}>
              <Text style={styles.btnCancelarText}>Parar alarme</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f8fafc",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    color: "#0f172a",
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 18,
    color: "#1e293b",
  },

  label: {
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    fontSize: 16,
    color: "#0f172a",
  },

  rapidosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  horaRapida: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },

  btnSelecionar: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  btnAdicionar: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  btnConfirmar: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 20,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  horarioBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e2e8f0",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
  },

  horarioTexto: {
    fontSize: 16,
    fontWeight: "600",
  },

  item: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemTexto: {
    fontSize: 16,
    fontWeight: "600",
  },

  removerBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  historicoItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },

  historicoTexto: {
    fontSize: 14,
  },

  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 22,
    width: "85%",
    alignItems: "center",
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#dc2626",
    marginBottom: 12,
  },

  btnOk: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },

  btnCancelar: {
    marginTop: 10,
  },

  btnCancelarText: {
    color: "#155e75",
    fontWeight: "bold",
  },
});
