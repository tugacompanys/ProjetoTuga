import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration, // <-- Importante
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Variável global do som
let soundObject;

// Função para tocar o alarme em loop
async function tocarAlarme() {
  try {
    soundObject = new Audio.Sound();
    await soundObject.setIsLoopingAsync(true);
    await soundObject.playAsync();
  } catch (error) {
    console.log("Erro ao tocar alarme:", error);
  }
}

// Função para parar o alarme
async function pararAlarme() {
  try {
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
    }
  } catch (error) {
    console.log("Erro ao parar alarme:", error);
  }
}

// Funções para vibrar
const startVibration = () => {
  const pattern = [500, 500]; // vibrar 0.5s, pausar 0.5s
  Vibration.vibrate(pattern, true); // true = repetir
};

const stopVibration = () => {
  Vibration.cancel();
};

export default function RegistroMedicamentoScreen() {
  const [medicamento, setMedicamento] = useState("");
  const [horario, setHorario] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [medicamentos, setMedicamentos] = useState([]);
  const [alarmeVisivel, setAlarmeVisivel] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // efeito de tremer
  const startShake = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    ).start();
  };

  // carregar lista salva ao iniciar
  useEffect(() => {
    async function carregarMedicamentos() {
      const data = await AsyncStorage.getItem("@meds");
      if (data) setMedicamentos(JSON.parse(data));
    }

    carregarMedicamentos();
  }, []);

  // salvar lista no AsyncStorage sempre que mudar
  useEffect(() => {
    AsyncStorage.setItem("@meds", JSON.stringify(medicamentos));
  }, [medicamentos]);

  // Verifica o horário a cada segundo e abre pop-up se houver correspondência
  useEffect(() => {
    const interval = setInterval(() => {
      const agora = new Date();
      const horaAtual = agora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      medicamentos.forEach((m) => {
        if (m.hora === horaAtual && !alarmeVisivel) {
          setAlarmeVisivel(true);
          startShake();
          tocarAlarme();
          startVibration(); // <-- inicia a vibração
        }
      });
    }, 1000); // checa a cada segundo

    return () => clearInterval(interval);
  }, [medicamentos, alarmeVisivel]);

  // Agendar notificação (ainda mantém para histórico ou notificações do sistema)
  async function agendarNotificacao() {
    if (!medicamento) {
      Alert.alert("Erro", "Digite o nome do medicamento.");
      return;
    }

    const novo = {
      id: Date.now().toString(),
      nome: medicamento,
      hora: horario.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMedicamentos([...medicamentos, novo]);
    setMedicamento(""); // limpa input
    Alert.alert("Sucesso", `Alarme para ${novo.nome} às ${novo.hora}`);
  }

  // Remover medicamento da lista
  async function removerMedicamento(id) {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💊 Registrar Medicamento/Insulina</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do medicamento/insulina"
        value={medicamento}
        onChangeText={setMedicamento}
      />

      <Button title="Selecionar horário" onPress={() => setMostrarPicker(true)} />

      {mostrarPicker && (
        <DateTimePicker
          value={horario}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(_event, selectedDate) => {
            const currentDate = selectedDate || horario;
            setMostrarPicker(false);
            setHorario(currentDate);
          }}
        />
      )}

      <Text style={styles.horario}>
        ⏰ Horário escolhido: {horario.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>

      <Button title="Agendar Alarme" onPress={agendarNotificacao} />

      <Text style={styles.subtitulo}>📋 Meus medicamentos</Text>
      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              💊 {item.nome} - ⏰ {item.hora}
            </Text>
            <TouchableOpacity onPress={() => removerMedicamento(item.id)} style={styles.removerBtn}>
              <Text style={{ color: "white" }}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* POPUP DE ALARME */}
      <Modal visible={alarmeVisivel} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.modalTitulo}>⏰ Alarme!</Text>
            <Text style={styles.modalTexto}>Hora do seu medicamento!</Text>
            <Button
              title="Parar Alarme"
              color="red"
              onPress={() => {
                pararAlarme();
                stopVibration(); // <-- para a vibração
                setAlarmeVisivel(false);
              }}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  horario: { marginVertical: 10, textAlign: "center", fontSize: 16 },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: { fontSize: 16 },
  removerBtn: { backgroundColor: "red", padding: 8, borderRadius: 6 },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  modalTitulo: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  modalTexto: { fontSize: 18, marginBottom: 20 },
});
