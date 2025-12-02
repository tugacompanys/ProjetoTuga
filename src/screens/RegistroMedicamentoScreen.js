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
  Modal,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

Notifications.setNotificationHandler({
  // corrigido: usar shouldShowAlert / shouldPlaySound / shouldSetBadge
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
  // note: padrões longos podem não ser suportados no iOS; ainda assim ok
  Vibration.vibrate([500, 500], true);
};

const stopVibration = () => {
  Vibration.cancel();
};

const colors = {
  azul: "#1e40afd0",
  azulClaro: "#38bdf8",
  verde: "#22c55e",
  verdeGlow: "#86efac",
  branco: "#ffffff",
  cinza: "#f1f5f9",
  escuro: "#0f172a",
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

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const [diasSelecionados, setDiasSelecionados] = useState([]);


  const toggleDia = (dia) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== dia));
    } else {
      setDiasSelecionados([...diasSelecionados, dia]);
    }
  };


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

  // carregar dados e pedir permissão de notificações
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem("@meds");
        const historic = await AsyncStorage.getItem("@historico");

        if (data) setMedicamentos(JSON.parse(data));
        if (historic) setHistorico(JSON.parse(historic));

        // pedir permissões (expo-notifications)
        await Notifications.requestPermissionsAsync();
      } catch (err) {
        console.log("Erro ao carregar dados iniciais:", err);
      }
    })();

    // cleanup ao desmontar: garantir que alarme/vibração/parada são executados
    return () => {
      // parar som/vibração/animacao se necessário
      pararAlarme().catch(() => { });
      stopVibration();
      if (shakeLoop.current) {
        try {
          shakeLoop.current.stop();
        } catch (e) { }
        shakeLoop.current = null;
      }
    };
  }, []);

  // persistir medicamentos/historico
  useEffect(() => {
    AsyncStorage.setItem("@meds", JSON.stringify(medicamentos));
  }, [medicamentos]);

  useEffect(() => {
    AsyncStorage.setItem("@historico", JSON.stringify(historico));
  }, [historico]);

  // checagem periódica (cada 30s) para abrir modal de alarme
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
  }, [medicamentos, alarmeVisivel, ultimoAlarmeRef]);


  const adicionarHorario = () => {
    let horaFormatada = null;

    if (/^\d{2}:\d{2}$/.test(horarioManual)) {
      horaFormatada = horarioManual;
    } else {
      horaFormatada = horario.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (horariosSelecionados.some(h => h.hora === horaFormatada)) {
      Alert.alert("Esse horário já foi adicionado.");
      return;
    }

    const novoHorario = {
      id: Date.now().toString(),
      hora: horaFormatada,
      animacao: new Animated.Value(1),
    };

    setHorariosSelecionados((prev) => [...prev, novoHorario]);
    setHorarioManual("");
  };


  const removerHorario = (id) => {
    const horarioParaRemover = horariosSelecionados.find(h => h.id === id);

    if (!horarioParaRemover) return;

    Animated.timing(horarioParaRemover.animacao, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setHorariosSelecionados((prev) =>
        prev.filter(h => h.id !== id)
      );
    });
  };

  async function agendarNotificacao() {
    if (!medicamento) return Alert.alert("Digite o nome do medicamento.");
    if (horariosSelecionados.length === 0) return Alert.alert("Adicione um horário.");

    try {
      for (let h of horariosSelecionados) {
        const [hora, minuto] = h.hora.split(":").map(Number);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Hora do medicamento",
            body: `Tomar: ${medicamento}`,
            sound: "default",
          },
          trigger: { hour: hora, minute: minuto, repeats: true },
        });
      }
      setDiasSelecionados([]);

      const novo = {
        id: Date.now().toString(),
        nome: medicamento,
        horarios: horariosSelecionados.map(h => h.hora), // ✅ agora só salva a string
        dias: diasSelecionados.length ? [...diasSelecionados] : [...diasSemana],
      };

      setMedicamentos([...medicamentos, novo]);
      setHorariosSelecionados([]);
      setMedicamento("");

      Alert.alert("✅ Alarme criado!");
    } catch (err) {
      console.log("Erro ao agendar notificação:", err);
      Alert.alert("Erro ao criar alarmes. Veja console.");
    }
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

    // parar alarmes / animações / vibração e fechar modal
    pararAlarme();
    stopVibration();
    if (shakeLoop.current) {
      try {
        shakeLoop.current.stop();
      } catch (e) { }
      shakeLoop.current = null;
    }
    setAlarmeVisivel(false);
    setMedicamentoAtual(null);
  };

  // se o alarme ficar visível por muito tempo, marca como não tomado automaticamente
  useEffect(() => {
    if (alarmeVisivel) {
      const timer = setTimeout(() => {
        if (alarmeVisivel) {
          registrarHistorico("nao_tomado");
        }
      }, 300000); // 5 minutos

      return () => clearTimeout(timer);
    }
  }, [alarmeVisivel]);

  const removerMedicamento = async (id) => {
    Alert.alert(
      "Remover medicamento",
      "Tem certeza que deseja remover?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const novaLista = medicamentos.filter(m => m.id !== id);
            setMedicamentos(novaLista);

            // (opcional) apaga notificações futuras
            await Notifications.cancelAllScheduledNotificationsAsync();
            Alert.alert("✅ Medicamento removido!");
          }
        }
      ]
    );
  };


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
              // se o usuário cancelar, selectedDate será undefined em algumas plataformas
              if (event.type === "dismissed" || !selectedDate) {
                setMostrarPicker(false);
                return;
              }
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

        {horariosSelecionados.map((h) => {
          if (!h || !h.hora) return null;

          return (
            <Animated.View
              key={h.id}
              style={[
                styles.horarioItemLinha,
                {
                  opacity: h.animacao,
                  transform: [{ scale: h.animacao }],
                },
              ]}
            >
              <Text style={styles.horarioTexto}>
                {String(h.hora)}
              </Text>

              <TouchableOpacity onPress={() => removerHorario(h.id)}>
                <Text style={styles.removerTexto}>🗑 Remover</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* MASCOTE (NÃO CORTA) */}
        <Image
          source={require("../../assets/tuga_prancheta.png")}
          style={styles.mascoteDireita}
        />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={styles.subtitulo}>📅 Dias da semana:</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {diasSemana.map((dia) => (
            <TouchableOpacity
              key={dia}
              onPress={() => toggleDia(dia)}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: diasSelecionados.includes(dia) ? "#22c55e" : "#cbd5e1",
                margin: 4
              }}
            >
              <Text style={{ color: diasSelecionados.includes(dia) ? "#fff" : "#000" }}>
                {dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        <Text style={styles.subtitulo}>💊 Medicamentos agendados</Text>

        {medicamentos.length === 0 && (
          <Text style={{ color: "#555" }}>Nenhum medicamento cadastrado</Text>
        )}

        {medicamentos.map((m) => (
          <View key={m.id} style={styles.medicamentoCard}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>
              💊 {m.nome}
            </Text>

            <Text>
              ⏰ Horários: {m.horarios?.join(", ") || "Não definido"}
            </Text>

            <Text>
              🔁 {m.horarios?.length || 0} vez(es) ao dia
            </Text>

            <Text>
              📅 Dias: {m.dias?.join(", ") || "Todos os dias"}
            </Text>


            <TouchableOpacity
              onPress={() => removerMedicamento(m.id)}
              style={styles.btnRemover}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>🗑 Remover</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>


      {/* ===== MODAL DO ALARME ===== */}
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
              <Text style={styles.btnText}>✅ Desligar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnAtrasado}
              onPress={async () => {
                if (!medicamentoAtual) return;

                // parar som + vibração
                pararAlarme();
                stopVibration();

                // agendar novo alarme em 10 minutos
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "⏰ Lembrete pausado",
                    body: `Tomar: ${medicamentoAtual.nome}`,
                    sound: "default",
                  },
                  trigger: {
                    seconds: 600, // 10 minutos
                  },
                });

                // registra no histórico como "atrasado"
                registrarHistorico("atrasado");
              }}
            >
              <Text style={styles.btnText}>⚠️ Pausar 10 min</Text>
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
    backgroundColor: colors.branco,
    padding: 14,
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
    fontSize: 26,
    fontWeight: "900",
    color: colors.azul,
    textAlign: "center",
    marginVertical: 12,
    letterSpacing: 1,
  },

  topo: {
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
  },
  descricao: {
    fontSize: 16,
    textAlign: "center",
    color: colors.escuro,
  },

  imagemTopo: {
    width: 140,
    height: 80,
    resizeMode: "contain",
    marginBottom: 8
  },

  // card
  card: {
    backgroundColor: colors.azul,
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,

    shadowColor: colors.azul,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },

    elevation: 10
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#fff",
  },

  input: {
    backgroundColor: colors.branco,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.azulClaro,
    fontSize: 16
  },

  inputHorario: {
    backgroundColor: "#ecfeff",
    padding: 14,
    borderRadius: 16,
    fontSize: 20,
    textAlign: "center",
    borderWidth: 2,
    borderColor: colors.azulClaro,
    marginBottom: 12
  },

  botaoAzul: {
    backgroundColor: colors.azulClaro,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,

    shadowColor: colors.azulClaro,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },


  botaoVerde: {
    backgroundColor: colors.verde,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",

    shadowColor: colors.verdeGlow,
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  horariosBox: {
    backgroundColor: "rgba(224,242,254,0.6)",
    borderRadius: 24,
    padding: 18,
    minHeight: 130,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },


  mascoteDireita: {
    width: 130,
    height: 139,
    position: "absolute",
    right: -15,
    bottom: -10,
    resizeMode: "contain",
    transform: [{ scaleX: -1 }]
  },

  botaoConfirmar: {
    backgroundColor: colors.escuro,
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 20,

    shadowColor: colors.azul,
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },


  subtitulo: {
    fontWeight: "800",
    marginBottom: 6
  },

  horarioItem: {
    marginLeft: 10
  },

  horarioItemLinha: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    paddingHorizontal: 10,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "75%",

    shadowColor: "#38bdf8",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  horarioTexto: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.azul,
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
    backgroundColor: colors.branco,
    width: "85%",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.verde,

    shadowColor: colors.verde,
    shadowOpacity: 0.5,
    shadowRadius: 20,
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

  medicamentoCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6
  },

  btnRemover: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center"
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

  // botão vermelho remover horário
  removerTexto: {
    color: "#ef4444",
    fontWeight: "700",
  }
});
