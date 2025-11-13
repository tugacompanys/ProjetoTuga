  // RegistroMedicamentoScreen.js
  import React, { useState, useRef, useEffect } from "react";
  import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder,
    ScrollView,
    Modal,
    TextInput,
    Image,
    Platform
  } from "react-native";
  import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
  import { Picker } from '@react-native-picker/picker'; 
  import DateTimePicker from '@react-native-community/datetimepicker';
  import { LayoutAnimation, UIManager } from "react-native";
  import * as Notifications from 'expo-notifications';


  // Handler atualizado (usa shouldShowBanner / shouldPlaySound)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowList: true,
    }),
  });

  // criar canal (aguarde o async) — execute dentro de um IIFE se estiver no topo
  (async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      } catch (e) {
        console.warn('Erro criando canal de notificação:', e);
      }
    }
  })();



  const DAYS_SHORT = ["D","S","T","Q","Q","S","S"];
  const DAYS_KEYS = [0,1,2,3,4,5,6];
  const { width, height } = Dimensions.get("window");

  export default function CalendarMedicationsScreen({ navigation }) {
    const [medicationsByDay, setMedicationsByDay] = useState({}); // armazenar por dia
    const [today, setToday] = useState(new Date());
    const [weekDays, setWeekDays] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    const animatedHeight = useRef(new Animated.Value(200)).current;

  // Modal visibilidade e campos do medicamento
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // tipo do medicamento
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medTime, setMedTime] = useState("");
  const [useOption, setUseOption] = useState("diasDaSemana"); // "diasDaSemana" ou "inicioFim"
  const [selectedDays, setSelectedDays] = useState([]);
  const [inicioTermino, setInicioTermino] = useState({ start: new Date(), end: new Date() });
  const [frequencia, setFrequencia] = useState(1);
  const [horarios, setHorarios] = useState(["08:00"]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [lembreMe, setLembreMe] = useState(false);
  const medicationsToShow = medicationsByDay[selectedDay] || [];
  const [takenTimes, setTakenTimes] = useState({}); 




  const [expandedCards, setExpandedCards] = useState({});
  const [medications, setMedications] = useState([
    {
      date: "5 de novembro",
      weekday: "Quarta-feira",
      name: "Metformina",
      category: "Comprimido",
      taken: 0,
      times: [
        { time: "08:00", dosage: "500mg" },
        { time: "12:00", dosage: "500mg" },
        { time: "18:00", dosage: "500mg" },
      ],
    },
    {
      date: "5 de novembro",
      weekday: "Quarta-feira",
      name: "Xarope",
      category: "Xarope",
      taken: 0,
      times: [
        { time: "09:00", dosage: "10ml" },
        { time: "21:00", dosage: "10ml" },
      ],
    },
  ]);

  const toggleCard = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  const markTaken = (medIndex, timeIndex) => {
    // Aqui você pode atualizar o estado para marcar que a dose foi tomada
    // Por exemplo:
    const newMeds = [...medications];
    newMeds[medIndex].taken += 1; // ou alguma lógica mais avançada
    setMedications(newMeds);
  };
  const getWeekdayName = (day) => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    return date.toLocaleDateString("pt-BR", { weekday: "long" });
  };




  // Tipos de remédio
  const types = [
    { key: "comprimido", icon: "pill", label: "Comprimido" },      
    { key: "gota", icon: "water", label: "Gotas" },
    { key: "xarope", icon: "bottle-tonic", label: "Xarope" },
    { key: "injecao", icon: "needle", label: "Injeção" },           
  ];

  // coloque logo após `types` (ou em qualquer lugar antes do return)
  const getTypeLabel = (typeKey) => {
    const found = types.find(t => t.key === typeKey);
    return found ? found.label : (typeKey || "—");
  };


  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  const toggleTaken = (medId, timeIndex, totalTimes) => {
    setTakenTimes(prev => {
      const current = prev[medId] || Array(totalTimes).fill(false);
      const updated = [...current];
      updated[timeIndex] = !updated[timeIndex];

      return {
        ...prev,
        [medId]: updated
      };
    });
  };

  const allTimesTaken = (medId, totalTimes) => {
    const data = takenTimes[medId];
    if (!data) return false;
    return data.filter(Boolean).length === totalTimes;
  };



  const handleAddHorario = () => {
    setHorarios([...horarios, "08:00"]);
  };
  const handleSaveMedication = async () => {
    if (!medName.trim()) {
      alert("Digite o nome do medicamento!");
      return;
    }

    const novoMed = {
      id: Date.now().toString(),
      name: medName,
      dosage: medDosage,
      type: selectedType,
      useOption,
      selectedDays,
      inicioTermino,
      frequencia,
      horarios,
      lembreMe,
    };


    const agendarNotificacao = async (nomeMedicamento, horario) => {
  try {
    const [hour, minute] = horario.split(":").map(Number);
    const agora = new Date();

    // Define a próxima execução no mesmo dia
    const proximaExecucao = new Date();
    proximaExecucao.setHours(hour);
    proximaExecucao.setMinutes(minute);
    proximaExecucao.setSeconds(0);

    // Se o horário já passou hoje, agenda pra amanhã
    if (proximaExecucao <= agora) {
      proximaExecucao.setDate(proximaExecucao.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💊 Hora de tomar o remédio!",
        body: `Está na hora de tomar ${nomeMedicamento}`,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: proximaExecucao, // dispara exatamente no horário
        repeats: true, // repete todo dia nesse horário
      },
    });

    console.log("⏰ Notificação agendada:", id, proximaExecucao.toLocaleString());
  } catch (error) {
    console.log("❌ Erro ao agendar notificação:", error);
  }
};


    // salva o medicamento
    setMedications(prev => [...prev, novoMed]);

  if (lembreMe) {
    for (const hora of horarios) {
      await agendarNotificacao(medName, hora);
    }
  }


    // --- salva o medicamento no(s) dia(s) correto(s) ---
    setMedicationsByDay(prev => {
      const updated = { ...prev };

      if (useOption === "diasDaSemana") {
        selectedDays.forEach(dayIndex => {
          for (let i = 1; i <= 31; i++) {
            const data = new Date(today.getFullYear(), today.getMonth(), i);
            if (data.getDay() === dayIndex) {
              const dayNumber = i;
              if (!updated[dayNumber]) updated[dayNumber] = [];
              updated[dayNumber].push(novoMed);
            }
          }
        });
      } else {
        const start = new Date(inicioTermino.start);
        const end = new Date(inicioTermino.end);
        const current = new Date(start);

        while (current <= end) {
          const dayNumber = current.getDate();
          if (!updated[dayNumber]) updated[dayNumber] = [];
          updated[dayNumber].push(novoMed);
          current.setDate(current.getDate() + 1);
        }
      }

      return updated;
    });

    // limpa os campos
    setMedName("");
    setMedDosage("");
    setSelectedType(null);
    setSelectedDays([]);
    setInicioTermino({ start: new Date(), end: new Date() });
    setUseOption("diasDaSemana");
    setFrequencia(1);
    setHorarios(["08:00"]);
    setLembreMe(false);
    setModalVisible(false);
  };


  useEffect(() => {
    const current = new Date();
    const dayOfWeek = current.getDay();
    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() - dayOfWeek);

    const tempWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      tempWeekDays.push(d.getDate());
    }
    setWeekDays(tempWeekDays);
  }, [today]);

  // 👇 adiciona esse NOVO useEffect logo depois
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log("🔔 Permissão de notificação:", finalStatus);

      if (Platform.OS === "android" && finalStatus === "granted") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }
    })();
  }, []); // 👈 roda só uma vez, quando o componente for montado


    useEffect(() => {
      const current = new Date();
      const dayOfWeek = current.getDay();
      const weekStart = new Date(current);
      weekStart.setDate(current.getDate() - dayOfWeek);

      const tempWeekDays = [];
      for(let i=0;i<7;i++){
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        tempWeekDays.push(d.getDate());
      }
      setWeekDays(tempWeekDays);
    }, [today]);
    const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (evt, gestureState) => {
        let newHeight = animatedHeight._value + gestureState.dy;
        // limites: altura mínima e máxima do card
        if (newHeight < 200) newHeight = 200;         // altura mínima
        if (newHeight > height * 0.6) newHeight = height * 0.6; // altura máxima do topo
        animatedHeight.setValue(newHeight);
      },
      onPanResponderRelease: () => {
        // decide se deve expandir ou recolher
        if (animatedHeight._value > 250) {
          Animated.spring(animatedHeight, {
            toValue: height * 0.6, // aqui aumenta o tamanho máximo
            useNativeDriver: false,
          }).start();
          setExpanded(true);
        } else {
          Animated.spring(animatedHeight, {
            toValue: 200, // altura mínima
            useNativeDriver: false,
          }).start();
          setExpanded(false);
        }
      },
    })
  ).current;


    const renderMedication = ({ item }) => (
      <View style={styles.medCard}>
        <Text style={styles.medName}>{item.name}</Text>
        <Text style={styles.medInfo}>{item.dosage}</Text>
        <Text style={styles.medInfo}>{item.time}</Text>
      </View>
    );

    const renderFullMonth = () => {
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month+1,0).getDate();
      const daysArray = Array.from({length: daysInMonth}, (_,i) => i+1);

      return (
        <View style={styles.fullMonthContainer}>
          {daysArray.map(day => {
            const isToday = day === today.getDate();
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={day}
                style={styles.dayWrapper}
                onPress={() => setSelectedDay(day)}
              >
                <View style={styles.dayCircleFull}>
                  <Text
                    style={[
                      styles.dayTextFull,
                      isToday && styles.todayText,
                      isSelected && styles.selectedText
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )
    };

    const medicationsToday = medicationsByDay[selectedDay] || [];

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.topContainer,{height:animatedHeight}]} {...panResponder.panHandlers}>
          <TouchableOpacity style={styles.backButton} onPress={()=>navigation?.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff"/>
          </TouchableOpacity>
          <Text style={styles.title}>REGISTRAR MEDICAMENTOS</Text>
          <Text style={styles.monthYear}>{today.toLocaleString('pt-BR',{month:'long'})} | {today.getFullYear()}</Text>

          {!expanded ? (
            <View style={styles.weekRow}>
              {DAYS_SHORT.map((d,i)=>(
                <TouchableOpacity key={i} style={styles.dayColumn} onPress={()=>setSelectedDay(weekDays[i])}>
                  <Text style={styles.dayShort}>{d}</Text>
                  <View style={styles.dayCircleSmall}>
                    <Text style={[
                      styles.dayNumberSmall,
                      weekDays[i] === today.getDate() && styles.today,
                      weekDays[i] === selectedDay && styles.selectedText
                    ]}>
                      {weekDays[i]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ScrollView style={{marginTop:20}}>
              {renderFullMonth()}
            </ScrollView>
          )}

        </Animated.View>{/* LISTA DE MEDICAMENTOS DO DIA */}
  <View style={styles.bottomContainer}>
    {Array.isArray(medicationsByDay[selectedDay]) &&
    medicationsByDay[selectedDay].length > 0 ? (
      medicationsByDay[selectedDay].map((med, index) => {
        const medId = med.id;
        const totalTimes = med.horarios?.length || 0;

        const timesTaken = takenTimes[medId] || Array(totalTimes).fill(false);
        const allTaken = timesTaken.every(t => t === true);

        // função para remover medicamento de todos os dias
        const removeMedication = () => {
          setMedications(prev => prev.filter(m => m.id !== medId));

          setMedicationsByDay(prev => {
            const updated = {};
            for (const day in prev) {
              updated[day] = prev[day].filter(m => m.id !== medId);
            }
            return updated;
          });

          setTakenTimes(prev => {
            const copy = { ...prev };
            delete copy[medId];
            return copy;
          });
        };

        return (
          <View style={styles.medCard} key={medId || index}>
            {/* Cabeçalho do card com botão X */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {`${selectedDay} de ${today.toLocaleString("pt-BR", {
                  month: "long",
                })}`}
              </Text>
              <Text style={{ color: "#555", fontSize: 16, paddingLeft: 80 }}>
                {getWeekdayName(selectedDay)}
              </Text>
              <TouchableOpacity onPress={removeMedication}>
                <Text style={{ fontSize: 20, color: "red", fontWeight: "bold" }}>
                  ⨯
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#ccc",
                marginBottom: 10,
              }}
            />

            {/* Linha com círculo principal + nome */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: allTaken ? "#0B58D8" : "#ccc",
                  marginRight: 10,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: "bold", marginRight: 10 }}>
                {med.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#555" }}>
                | {getTypeLabel(med.type)}
              </Text>
            </View>

            {/* Status */}
            <Text style={{ fontSize: 14, color: "#999", marginBottom: 10 }}>
              {timesTaken.filter(t => t === true).length} de {totalTimes} foram tomados
            </Text>

            {/* Botão expandir/ocultar horários */}
            {totalTimes > 0 && (
              <TouchableOpacity
                onPress={() => toggleCard(index)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#f2f2f2",
                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  {expandedCards[index] ? "Ocultar horários" : "Ver horários"}
                </Text>
                <Text style={{ fontSize: 18 }}>
                  {expandedCards[index] ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Horários — aparecem quando expandido */}
            {expandedCards[index] && (
              <View
                style={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 10,
                  padding: 10,
                  marginTop: -5,
                  marginBottom: 10,
                }}
              >
                {med.horarios.map((hora, idx) => {
                  const isTaken = timesTaken[idx];

                  return (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: isTaken ? "#0B58D8" : "#ccc",
                          marginRight: 10,
                        }}
                        onPress={() => toggleTaken(medId, idx, totalTimes)}
                      />
                      <Text style={{ fontSize: 14 }}>{hora}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })
    ) : (
      <View style={styles.emptyContainer}>

                <Image
                  source={require("../../assets/tuga_prancheta.png")}
                  style={styles.mascote}
                  resizeMode="contain"
                />
                              <Image
                  source={require("../../assets/remedio.png")}
                  style={styles.remedio}
                  resizeMode="contain"
                />

        <Text style={styles.emptyText}>
          Nenhum medicamento registrado para este dia
        </Text>
      </View>
    )}
  </View>



        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
    <Text style={styles.addButtonText}>+</Text>
  </TouchableOpacity>

  <Modal
    visible={modalVisible}
    animationType="slide"
    transparent={false}
    onRequestClose={() => setModalVisible(false)}
  >
    <ScrollView contentContainerStyle={styles.modalScroll}>
      {/* Imagem e subtítulo */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={require("../../assets/tuga_bodybuilder.png")} // substitua pela sua imagem
          style={{ width: 120, height: 120, marginBottom: 10 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 16, color: "#555", textAlign: "center" }}>
          Registre seus medicamentos para cuidar da sua diabetes diariamente
        </Text>
      </View>

      {/* Tipos de medicamentos */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Tipos de medicamentos</Text>
      <View style={styles.typeRow}>
        {types.map(t => (
          <View key={t.key} style={{ alignItems: "center" }}>
            <TouchableOpacity
              style={[styles.typeCard, selectedType === t.key && { borderColor: "#31A9FF", borderWidth: 2 }]}
              onPress={() => setSelectedType(t.key)}
            >
              <MaterialCommunityIcons name={t.icon} size={30} color="#0B58D8" />
            </TouchableOpacity>
            <Text style={{ marginTop: 5 }}>{t.label}</Text>
          </View>
        ))}
      </View>

      {/* Nome e dosagem */}
      <TextInput
        placeholder="Nome do medicamento"
        style={styles.input}
        value={medName}
        onChangeText={setMedName}
      />
      <TextInput
        placeholder="Dosagem"
        style={styles.input}
        value={medDosage}
        onChangeText={setMedDosage}
      />

      {/* Dias da semana / Início-Fim */}
      <View style={styles.optionRow}>
        <TouchableOpacity
          onPress={() => setUseOption("diasDaSemana")}
          style={[styles.optionButton, useOption === "diasDaSemana" && { backgroundColor: "#0B58D8" }]}
        >
          <Text style={[styles.optionText, useOption === "diasDaSemana" && { color: "#fff" }]}>Dias da semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setUseOption("inicioFim")}
          style={[styles.optionButton, useOption === "inicioFim" && { backgroundColor: "#0B58D8" }]}
        >
          <Text style={[styles.optionText, useOption === "inicioFim" && { color: "#fff" }]}>Início/Termino</Text>
        </TouchableOpacity>
      </View>

      {useOption === "diasDaSemana" && (
        <View style={styles.weekDaysRow}>
          {DAYS_SHORT.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.weekDayCard, selectedDays.includes(i) && { backgroundColor:"#31A9FF" }]}
              onPress={() => toggleDay(i)}
            >
              <Text style={{ color: selectedDays.includes(i) ? "#fff" : "#000", fontWeight: "bold" }}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {useOption === "inicioFim" && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text>{inicioTermino.start.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.input, { flex: 1 }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Text>{inicioTermino.end.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DateTimePickers */}
      {showStartPicker && (
        <DateTimePicker
          value={inicioTermino.start}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setInicioTermino(prev => ({ ...prev, start: date }));
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={inicioTermino.end}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setInicioTermino(prev => ({ ...prev, end: date }));
          }}
        />
      )}

      {/* Frequência */}
      <Text style={{ marginTop: 15, marginBottom: 5 }}>Frequência de uso</Text>
      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 15, marginBottom: 15 }}>
        <Picker
          selectedValue={frequencia}
          onValueChange={(value) => {
            setFrequencia(value);
            setHorarios(prev => {
              const copy = [...prev];
              while (copy.length < value) copy.push("08:00");
              return copy.slice(0, value);
            });
          }}
        >
          <Picker.Item label="1 vez ao dia" value={1} />
          <Picker.Item label="2 vezes ao dia" value={2} />
          <Picker.Item label="3 vezes ao dia" value={3} />
          <Picker.Item label="4 vezes ao dia" value={4} />
        </Picker>
      </View>

      {/* Horários em linha */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {horarios.map((hora, idx) => (
          <TextInput
            key={idx}
            placeholder="HH:MM"
            keyboardType="number-pad"
            style={[styles.input, { width: 100, marginRight: 10 }]}
            value={hora}
            onChangeText={text => {
              let cleaned = text.replace(/\D/g, "");
              if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

              if (cleaned.length >= 3) {
                const h = parseInt(cleaned.slice(0, 2));
                const m = parseInt(cleaned.slice(2, 4));

                if (h > 23 || m > 59) {
                  alert("Horário inválido! Máximo 23:59");
                  return;
                }

                const formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
                setHorarios(prev => {
                  const copy = [...prev];
                  copy[idx] = formatted;
                  return copy;
                });
              } else {
                setHorarios(prev => {
                  const copy = [...prev];
                  copy[idx] = cleaned;
                  return copy;
                });
              }
            }}
          />
        ))}
      </ScrollView>

      {/* Lembre-me como último item */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Lembre-me</Text>
        <TouchableOpacity
          onPress={() => setLembreMe(prev => !prev)}
          style={{
            width: 50,
            height: 30,
            borderRadius: 15,
            backgroundColor: lembreMe ? "#0B58D8" : "#ccc",
            justifyContent: "center",
            paddingHorizontal: 2,
          }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: "#fff",
              alignSelf: lembreMe ? "flex-end" : "flex-start",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Botão salvar */}
      <TouchableOpacity
        onPress={handleSaveMedication}
        style={{ backgroundColor: "#000000ff", padding: 15, borderRadius: 10, marginTop: 0, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  </Modal>

      </View>
    )
  }

  const styles = StyleSheet.create({
    container:{flex:1,backgroundColor:'#f2f2f2'},
    topContainer:{backgroundColor: '#5DE884', paddingTop:40, paddingHorizontal:5,},
    backButton:{position:'absolute',top:50,left:20,zIndex:10},
    title:{color:'#fff', fontSize:16,fontWeight:'bold',textAlign:'center'},
    monthYear:{color:'#fff',fontSize:18,textAlign:'center',marginTop:8, fontWeight: "300" },
    weekRow:{flexDirection:'row',justifyContent:'space-between',marginTop:20},
    dayColumn:{alignItems:'center',width:width/7 -5},
    dayShort:{color:'#ffffffff',fontSize:16,fontWeight:'bold'},
    dayCircleSmall:{backgroundColor:'#fff', borderRadius:40, width:40,height:40, alignItems:'center', justifyContent:'center', marginTop:6},
    dayNumberSmall:{color:'#b2b2b5a4', fontSize:18, fontWeight:'500'},
    today:{color:'#000000ff'},
    bottomContainer:{flex:1, paddingHorizontal:20, paddingTop:20},
    emptyContainer:{flex:1, alignItems:'center', justifyContent:'center'},
    emptyText:{fontSize: 18, color:'#999', alignSelf: "center", left: 15, bottom: 30},
    addButton:{position:'absolute', right:20, bottom:80, backgroundColor:'#0B58D8', width:60,height:60,borderRadius:30, alignItems:'center',justifyContent:'center',elevation:5},
    addButtonText:{color:'#fff', fontSize:32, fontWeight:'bold'},
    medCard:{backgroundColor:'#fff', padding:15, borderRadius:15, marginBottom:15, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:5, elevation:3},
    medName:{fontSize:18,fontWeight:'bold'},
    medInfo:{fontSize:14,color:'#555'},

    fullMonthContainer:{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between'},
    dayWrapper:{width: width/6   -5, alignItems:'center', marginVertical:8},
    dayCircleFull:{backgroundColor:'#fff', borderRadius:25, width:40,height:40, alignItems:'center', justifyContent:'center'},
    dayTextFull:{color:'#b2b2b5a4', fontSize:18, fontWeight:'bold'},
    todayText:{color:'#000000ff'},
  modalScroll: { flexGrow: 1, backgroundColor: "#fff", padding: 20 },
  modalTop: { backgroundColor: "#6C63FF", borderRadius: 15, paddingVertical: 20, paddingHorizontal: 10, marginBottom: 30 },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center" },
  typeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  typeCard: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 15, padding: 15, fontSize: 16, marginTop: 15 },
  optionRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 15 },
  optionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: "#f0f0f0" },
  optionText: { fontWeight: "bold" },
  weekDaysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  weekDayCard: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" },
  mascote: {widht: 200, height: 200, marginBottom: 0, marginTop: -100, right: 60},
  remedio: {widht: 60, height: 60, left: 90, bottom: 70}
  });