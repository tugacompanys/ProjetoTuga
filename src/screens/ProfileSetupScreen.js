// ProfileSetupScreen.js
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ToastAndroid,
  Image,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  PanResponder
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const STEPS = 6;

const ACTIVITY = [
  { key: "sedentario", label: "Sedentário", value: 1.2, subtitle: "Pouco ou nenhum exercício" },
  { key: "leve", label: "Leve (1-3x/sem)", value: 1.375, subtitle: "Exercício leve" },
  { key: "moderado", label: "Moderado (3-5x/sem)", value: 1.55, subtitle: "Exercício moderado" },
  { key: "intenso", label: "Intenso (6-7x/sem)", value: 1.725, subtitle: "Ativo" },
  { key: "atleta", label: "Atleta", value: 1.9, subtitle: "Atleta profissional" },
];
const GOALS = [
  { label: "Manter", value: "manter", adj: 0, subtitle: "Manter peso" },
  { label: "Perder", value: "perder", adj: -300, subtitle: "Perda moderada" },
  { label: "Ganhar", value: "ganhar", adj: 300, subtitle: "Ganho moderado" },
];
const MACROS_PCT = { carbs: 0.5, protein: 0.2, fat: 0.3 };
const MEALS_SPLIT = { cafe: 0.25, almoco: 0.35, jantar: 0.3, lanche: 0.1 };

function toNumber(v) {
  const n = Number(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
function distributeInteger(total, fractions) {
  const roundedTotal = Math.round(total);
  const entries = Object.entries(fractions);
  const exact = entries.map(([k, frac]) => ({ k, frac, exact: roundedTotal * frac }));
  const floored = exact.map(e => Math.floor(e.exact));
  let remainder = roundedTotal - floored.reduce((s, v) => s + v, 0);
  const fracParts = exact.map((e, i) => ({ idx: i, part: e.exact - Math.floor(e.exact) }));
  fracParts.sort((a, b) => b.part - a.part);
  const allocated = floored.slice();
  let i = 0;
  while (remainder > 0) { allocated[fracParts[i % fracParts.length].idx] += 1; remainder--; i++; }
  return Object.fromEntries(entries.map((e, idx) => [e[0], allocated[idx]]));
}
function mifflin({ sexo, pesoKg, alturaCm, idade }) {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  return sexo === "masculino" ? base + 5 : base - 161;
}
function buildPlan({ sexo, peso, altura, idade, atividade, objetivo }) {
  const bmrRaw = mifflin({ sexo, pesoKg: toNumber(peso), alturaCm: toNumber(altura), idade: toNumber(idade) });
  const tdeeRaw = bmrRaw * toNumber(atividade);
  const goalAdj = GOALS.find(g => g.value === objetivo)?.adj ?? 0;
  const kcal = Math.max(1200, Math.round(tdeeRaw + goalAdj));

  const macros = {
    kcal,
    carbs_g: Math.round((kcal * MACROS_PCT.carbs) / 4),
    protein_g: Math.round((kcal * MACROS_PCT.protein) / 4),
    fat_g: Math.round((kcal * MACROS_PCT.fat) / 9),
  };

  const perMealKcal = distributeInteger(kcal, MEALS_SPLIT);
  const perMealCarbs = distributeInteger(macros.carbs_g, MEALS_SPLIT);
  const perMealProtein = distributeInteger(macros.protein_g, MEALS_SPLIT);
  const perMealFat = distributeInteger(macros.fat_g, MEALS_SPLIT);

  const perMeal = Object.fromEntries(
    Object.keys(MEALS_SPLIT).map(k => [k, { kcal: perMealKcal[k], carbs_g: perMealCarbs[k], protein_g: perMealProtein[k], fat_g: perMealFat[k] }])
  );

  return { bmr: Math.round(bmrRaw), tdee: Math.round(tdeeRaw), macros, perMeal };
}




const Ruler = ({ min = 30, max = 150, value, onChange, scale = 1.3 }) => {
  const containerWidth = width * 0.8;
  const totalUnits = max - min;

  // largura fixa pra cada ponteiro (espacamento real)
  const tickWidth = 18;

  const innerWidth = tickWidth * totalUnits * scale;

  const panX = useRef(new Animated.Value(0)).current;
  const startOffsetRef = useRef(0);


  const ticks = React.useMemo(() => {
    const arr = [];
    for (let i = min; i <= max; i++) {
      arr.push({ value: i, isBig: i % 10 === 0 });
    }
    return arr;
  }, [min, max]);

  useEffect(() => {
    const centerOffset = containerWidth / 2 - tickWidth / 2;
    const initial = centerOffset - (value - min) * tickWidth;

    panX.setValue(initial);
    startOffsetRef.current = initial;
  }, [value, containerWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        panX.stopAnimation((curr) => {
          startOffsetRef.current = curr;
        });
      },

      onPanResponderMove: (_, g) => {
        const centerOffset = containerWidth / 2 - tickWidth / 2;
        const maxOffset = centerOffset;
        const minOffset = centerOffset - totalUnits * tickWidth;

        let newOffset = startOffsetRef.current + g.dx;
        newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);

        panX.setValue(newOffset);
      },

      onPanResponderRelease: (_, g) => {
        const centerOffset = containerWidth / 2 - tickWidth / 2;
        const maxOffset = centerOffset;
        const minOffset = centerOffset - totalUnits * tickWidth;

        let final = startOffsetRef.current + g.dx;
        final = Math.max(Math.min(final, maxOffset), minOffset);

        let newValue = min + Math.round((centerOffset - final) / tickWidth);
        newValue = Math.max(min, Math.min(max, newValue));

        onChange(newValue);

        Animated.timing(panX, {
          toValue: centerOffset - (newValue - min) * tickWidth,
          duration: 90,
          useNativeDriver: true,
        }).start(() => {
          startOffsetRef.current = centerOffset - (newValue - min) * tickWidth;
        });
      },
    })
  ).current;

  return (
    <View
      style={{
        width: "90%",
        alignSelf: "center",
        backgroundColor: "#fff",
        borderRadius: 30,
        padding: 12,
        elevation: 4,
        top: -10,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 40,
          fontWeight: "800",
          color: "#2EA3FC",
          marginBottom: 8,
        }}
      >
        {value}
      </Text>

      <View
        style={{
          width: "100%",
          height: 90,
          overflow: "hidden",
        }}
        {...panResponder.panHandlers}
      >
        {/* Cabeça arredondada do ponteiro */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "50%",
            top: -10,
            marginLeft: -20,
            width: 40,
            height: 26,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "50%",
            top: 5,
            marginLeft: -15,
            width: 30,
            height: 100,
            borderLeftWidth: 15,
            borderRightWidth: 15,
            borderTopWidth: 22,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "#2EA3FC",
            zIndex: 9,
          }}
        />



        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "50%",
            width: 4,
            height: 40,
            backgroundColor: "#2EA3FC",
            top: 20,
            marginLeft: -2,
            borderRadius: 999,
            zIndex: 9,
          }}
        />


        <Animated.View
          style={{
            flexDirection: "row",
            width: innerWidth,
            transform: [{ translateX: panX }],
          }}
        >
          {ticks.map((tick, i) => (
            <View
              key={i}
              style={{
                width: tickWidth,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 3,
                  height: tick.isBig ? 36 : 18,
                  backgroundColor: tick.isBig ? "#2EA3FC" : "#A9D4FF",
                  borderRadius: 2,
                  marginTop: 24,
                }}
              />
              {tick.isBig && (
                <Text style={{ fontSize: 11, marginTop: 4 }}>
                  {tick.value}
                </Text>
              )}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};
/* ==========================
   Main screen
   ========================== */
export default function ProfileSetupScreen({ navigation, route }) {
  // stepper
  const [step, setStep] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value((1 / STEPS) * width)).current;

  // profile fields
  const [sexo, setSexo] = useState("feminino");
  const [idade, setIdade] = useState(""); // dd/mm/yyyy
  const [peso, setPeso] = useState(60.0);
  const [altura, setAltura] = useState(170);
  const [atividade, setAtividade] = useState(ACTIVITY[0].value.toString());
  const [objetivo, setObjetivo] = useState("manter");
  const [tipoDiabetes, setTipoDiabetes] = useState("nenhum");
  const [medicamentos, setMedicamentos] = useState("");
  const [userId] = useState(route?.params?.user?.uid || "user-test");

  // modals / animations
  const slideAlturaAnim = useRef(new Animated.Value(height)).current;
  const [showAlturaModal, setShowAlturaModal] = useState(false);
  const [alturaTemp, setAlturaTemp] = useState(altura);
  const scaleMascote = useRef(new Animated.Value(altura / 170)).current;

  // new modals for sexo & date
  const [showSexoModal, setShowSexoModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateInput, setDateInput] = useState(idade);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: -(step - 1) * width,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: (step / STEPS) * width,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    // mascote scale reacting to alturaTemp
    const targetScale = (alturaTemp || 170) / 170;
    Animated.spring(scaleMascote, {
      toValue: targetScale,
      bounciness: 8,
      speed: 6,
      useNativeDriver: true,
    }).start();
  }, [alturaTemp]);

  const openAlturaModal = () => {
    setAlturaTemp(altura || 170);
    setShowAlturaModal(true);
    Animated.timing(slideAlturaAnim, { toValue: height / 3, duration: 260, useNativeDriver: false }).start();
  };
  const closeAlturaModal = () => {
    Animated.timing(slideAlturaAnim, { toValue: height, duration: 200, useNativeDriver: false }).start(() => setShowAlturaModal(false));
  };


  const [imc, setImc] = useState(null);
  // IMC calculation

  const calcIMC = () => {
    const h = parseFloat(altura) / 100;
    const p = parseFloat(peso);
    if (!h || !p || isNaN(h) || isNaN(p)) return null;
    const res = p / (h * h);
    return Math.round(res * 10) / 10;
  };
  const calcIdealRange = (hCm) => {
    const h = parseFloat(hCm) / 100;
    if (!h || isNaN(h)) return { min: null, max: null };
    const min = Math.round(18.5 * h * h * 10) / 10;
    const max = Math.round(24.9 * h * h * 10) / 10;
    return { min, max };
  };

  // DATE MASK + validation helpers
  const maskDate = (text) => {
    // keep digits only
    const digits = (text || "").replace(/\D/g, "").slice(0, 8); // DDMMYYYY max 8 digits
    let out = digits;
    if (digits.length >= 3 && digits.length <= 4) {
      out = digits.slice(0, 2) + "/" + digits.slice(2);
    } else if (digits.length >= 5 && digits.length <= 8) {
      out = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    } else if (digits.length <= 2) {
      out = digits;
    }
    return out;
  };

  const handleDateChange = (t) => {
    const m = maskDate(t);
    setDateInput(m);
  };

  const validateAndSaveDate = () => {
    const txt = dateInput;
    if (!txt || txt.length !== 10) {
      Alert.alert("Data inválida", "Informe a data no formato DD/MM/AAAA.");
      return false;
    }
    const [ddS, mmS, yyyyS] = txt.split("/");
    const dd = Number(ddS), mm = Number(mmS), yyyy = Number(yyyyS);
    if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) {
      Alert.alert("Data inválida", "Informe apenas números na data.");
      return false;
    }
    // basic ranges
    if (yyyy < 1900 || yyyy > new Date().getFullYear()) {
      Alert.alert("Data inválida", "Ano inválido.");
      return false;
    }
    if (mm < 1 || mm > 12) {
      Alert.alert("Data inválida", "Mês inválido.");
      return false;
    }
    const daysInMonth = new Date(yyyy, mm, 0).getDate();
    if (dd < 1 || dd > daysInMonth) {
      Alert.alert("Data inválida", "Dia inválido para o mês informado.");
      return false;
    }
    const selected = new Date(yyyy, mm - 1, dd);
    const today = new Date();
    if (selected > today) {
      Alert.alert("Data inválida", "A data não pode ser no futuro.");
      return false;
    }
    const age = today.getFullYear() - yyyy - ((today.getMonth() < (mm - 1) || (today.getMonth() === (mm - 1) && today.getDate() < dd)) ? 1 : 0);
    if (age > 120) {
      Alert.alert("Data inválida", "Idade superior a 120 anos não é permitida.");
      return false;
    }
    // ok
    setIdade(txt);
    setShowDateModal(false);
    return true;
  };

  // Preview plan (live)
  const canPreview = sexo && idade && peso && altura && atividade && objetivo;
  const preview = useMemo(() => canPreview ? buildPlan({ sexo, peso, altura, idade: parseInt(String(idade).slice(-4)) || 30, atividade, objetivo }) : null, [sexo, idade, peso, altura, atividade, objetivo]);

  // navigation / save
  async function handleSalvar() {
    if (!canPreview) { Alert.alert("Preencha todos os campos obrigatórios."); return; }
    try {
      const parsedIdade = (() => {
        // idade could be dd/mm/yyyy or number; try to extract year difference
        if (!idade) return 30;
        const parts = String(idade).split("/");
        if (parts.length === 3) {
          const y = Number(parts[2]);
          const a = new Date().getFullYear() - y;
          return a;
        } else if (!isNaN(Number(idade))) {
          return Number(idade);
        }
        return 30;
      })();

      const perfil = { sexo, idade: parsedIdade, peso: Number(peso), altura: Number(altura), atividade: Number(atividade), objetivo, tipoDiabetes, medicamentos, updatedAt: Date.now() };
      const plano = buildPlan({ sexo, peso, altura, idade: parsedIdade, atividade, objetivo });

      await AsyncStorage.setItem("@user_profile", JSON.stringify(perfil));
      await AsyncStorage.setItem("@nutrition_plan", JSON.stringify(plano));
      await addDoc(collection(db, "profiles"), { userId, perfil, plano, createdAt: serverTimestamp() });
      await addDoc(collection(db, "users", userId, "historico"), { plano, macros: plano.macros, perMeal: plano.perMeal, createdAt: serverTimestamp() });

      ToastAndroid.show("Plano salvo com sucesso!", ToastAndroid.SHORT);
      navigation.replace("IndiceDiario", { userId, plano });
    } catch (e) {
      console.error(e);
      Alert.alert("Erro ao salvar os dados.");
    }
  }

  // next/back
  const next = () => {
    // basic validations per step
    if (step === 1) {
      if (!sexo || !idade || !altura) { Alert.alert("Atenção", "Preencha sexo, data de nascimento e altura para continuar."); return; }
    }
    if (step === 2) {
      if (!peso) { Alert.alert("Atenção", "Informe seu peso para continuar."); return; }
    }
    if (step < STEPS) setStep(s => s + 1);
    else handleSalvar();
  };
  const back = () => { if (step > 1) setStep(s => s - 1); };

  /* ==========================
     Page components (wizard)
     ========================== */
  const Step1 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Informações básicas</Text>
      <View
        style={[
          styles.infoBox,
          {
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderRadius: 30,
            width: "95%",
            alignSelf: "center",
            marginTop: 6,
          },
        ]}
      >
        {/* GÊNERO */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomWidth: 0, marginBottom: 5 }]}
          activeOpacity={0.8}
          onPress={() => setShowSexoModal(true)} // seu modal de sexo
        >
          <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
            <View style={{ flexDirection: "row", marginRight: 8 }}>
              <FontAwesome5 name="mars" size={22} color="#2EA3FC" style={{ marginRight: -4 }} />
              <FontAwesome5 name="venus" size={22} color="#FF69B4" />
            </View>
            <Text style={styles.infoLabel}>Gênero</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* mostra "Selecione" se sexo vazio */}
            <Text style={styles.infoValue}>{sexo || "Selecione"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>

        {/* ALTURA */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomWidth: 0, marginBottom: 5 }]}
          activeOpacity={0.8}
          onPress={openAlturaModal}
        >
          <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
            <FontAwesome5 name="child" size={22} color="#2EA3FC" style={{ marginRight: 12 }} />
            <Text style={styles.infoLabel}>Altura</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.infoValue}>{altura ? `${altura} cm` : "Selecione"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>

        {/* DATA DE NASCIMENTO */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomWidth: 0, marginBottom: 0 }]}
          activeOpacity={0.8}
          onPress={() => {
            setDateInput(idade || "");
            setShowDateModal(true);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
            <FontAwesome5 name="birthday-cake" size={22} color="#FFA500" style={{ marginRight: 12 }} />
            <Text style={styles.infoLabel}>Data de Nascimento</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.infoValue}>{idade || "Selecione"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
  const Step2 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Qual é o seu
        {"\n"}
        peso atual?</Text>

      {/* Card de peso com mascote e textos */}
      <View style={styles.imcCard}>
        {/* Textos do IMC */}
        <View style={styles.imcTextContainer}>
          <Text style={styles.imcLabel}>IMC Atual</Text>
          <Text style={styles.imcValue}>{imc || calcIMC() || "--"}</Text>
          <Text style={styles.imcRange}>Faixa de Peso Ideal</Text>
          <Text
            style={[styles.imcRangeValue, { flexShrink: 1 }]}
            numberOfLines={1}
          >
            {(() => {
              const r = calcIdealRange(altura);
              if (!r.min) return "--";
              return `${r.min} - ${r.max}`;
            })()}
          </Text>

        </View>

        {/* Mascote posicionado independente */}
        <View style={styles.imcMascoteWrap}>
          <Image
            source={require("../../assets/tuga_prancheta.png")}
            style={styles.imcMascote}
            resizeMode="contain"
          />
        </View>
      </View>


      {/* Ruler */}
      <View style={styles.weightPicker}>
        <Ruler value={peso} step={0.1} min={30} max={150} onChange={setPeso} />
      </View>
      <View style={{ marginTop: 25, marginBottom: 40 }}>
        <Text style={{ textAlign: "center", top: 90, fontSize: 13, color: "#989898" }}>
          Para sua saúde, tente não se afastar muito da faixa de {"\n"} peso ideal.
        </Text>
      </View>

    </View>
  );




  const Step3 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Nível de atividade</Text>
      <View style={{ paddingTop: 10 }}>
        {ACTIVITY.map(a => (
          <TouchableOpacity key={a.key} style={[styles.activityRow, atividade === a.value.toString() && styles.activityRowActive]} onPress={() => setAtividade(a.value.toString())}>
            <View>
              <Text style={[styles.activityTitle, atividade === a.value.toString() && { color: "#fff" }]}>{a.label}</Text>
              <Text style={[styles.activitySubtitle, atividade === a.value.toString() && { color: "#fff" }]}>{a.subtitle}</Text>
            </View>
            <View style={[styles.chev, atividade === a.value.toString() && { borderColor: "transparent" }]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Step4 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Qual o seu objetivo?</Text>
      <View style={{ paddingTop: 20 }}>
        {GOALS.map(g => (
          <TouchableOpacity key={g.value} onPress={() => setObjetivo(g.value)} style={[styles.goalCard, objetivo === g.value && styles.goalCardActive]}>
            <Text style={[styles.goalTitle, objetivo === g.value && { color: "#fff" }]}>{g.label}</Text>
            <Text style={[styles.goalSubtitle, objetivo === g.value && { color: "#fff" }]}>{g.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Step5 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Tipo de diabetes</Text>
      <View style={{ paddingTop: 10 }}>
        {[
          { key: "nenhum", title: "Sem diabetes", subtitle: "Você não possui diagnóstico de diabetes" },
          { key: "pre-diabetes", title: "Pré-diabetes", subtitle: "Níveis de glicose elevados" },
          { key: "tipo1", title: "Diabetes tipo 1", subtitle: "Dependência de insulina" },
          { key: "tipo2", title: "Diabetes tipo 2", subtitle: "Controle por dieta/medicação" },
          { key: "gestacional", title: "Diabetes gestacional", subtitle: "Durante a gravidez" },
        ].map(o => (
          <TouchableOpacity key={o.key} onPress={() => setTipoDiabetes(o.key)} style={[styles.activityRow, tipoDiabetes === o.key && styles.activityRowActive]}>
            <View>
              <Text style={[styles.activityTitle, tipoDiabetes === o.key && { color: "#fff" }]}>{o.title}</Text>
              <Text style={[styles.activitySubtitle, tipoDiabetes === o.key && { color: "#fff" }]}>{o.subtitle}</Text>
            </View>
            <View style={[styles.chev, tipoDiabetes === o.key && { borderColor: "transparent" }]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Step6 = (
    <View style={[styles.page, { width }]}>
      <Text style={styles.centerTitle}>Medicamentos (opcional)</Text>
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <TextInput
          value={medicamentos}
          onChangeText={setMedicamentos}
          placeholder="Insulina, metformina, etc."
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          multiline
        />
      </View>

      <TouchableOpacity onPress={handleSalvar} style={styles.saveBtn}>
        <Text style={styles.saveTxt}>💾 Salvar plano</Text>
      </TouchableOpacity>
    </View>
  );

  const pages = [Step1, Step2, Step3, Step4, Step5, Step6];

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Animated.View style={[styles.progressFill, { width: progress }]} />
        </View>

        <Animated.View style={{ flexDirection: "row", width: width * pages.length, transform: [{ translateX }] }}>
          {pages.map((p, idx) => (
            <View key={`page_${idx}`} style={{ width, minHeight: height - 200 }}>
              <View style={{ flex: 1 }}>
                {p}
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.circleBack} onPress={back} activeOpacity={0.8}>
            <Text style={{ fontSize: 22, color: "#2EA3FC" }}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={next} activeOpacity={0.9}>
            <Text style={styles.continueText}>{step < STEPS ? "Continuar" : "Concluir"}</Text>
          </TouchableOpacity>
        </View>

        {/* Preview panel (aparece somente no último step quando os dados estiverem completos) */}
        {step === STEPS && preview && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Prévia do Plano</Text>
            <Text style={styles.previewLine}>BMR: {preview.bmr} kcal — TDEE: {preview.tdee} kcal</Text>
            <Text style={styles.previewLine}>Meta diária: {preview.macros.kcal} kcal — C:{preview.macros.carbs_g}g · P:{preview.macros.protein_g}g · G:{preview.macros.fat_g}g</Text>
            <View style={{ marginTop: 8 }}>
              {Object.entries(preview.perMeal).map(([ref, v]) => (
                <Text key={ref} style={styles.previewLine}>
                  {ref === "cafe" ? "Café" : ref === "almoco" ? "Almoço" : ref === "jantar" ? "Jantar" : "Lanche"} → {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Altura modal */}
        <Modal animationType="slide" transparent visible={showAlturaModal} onRequestClose={closeAlturaModal}>
          <View style={styles.modalBackground}>
            <View style={styles.bottomCardModal}>
              <Text style={styles.modalHeader}>Altura</Text>
              <View style={styles.modalContent}>
                <Animated.Image source={require("../../assets/tuga_bodybuilder.png")} resizeMode="contain" style={{ width: 140, height: 180, transform: [{ scale: scaleMascote }] }} />
                <View style={styles.controles}>
                  <TouchableOpacity onPress={() => setAlturaTemp(prev => Math.min((prev || 170) + 10, 250))} style={styles.botaoControle}><Text>+10</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setAlturaTemp(prev => Math.min((prev || 170) + 1, 250))} style={styles.botaoControle}><Text>+1</Text></TouchableOpacity>

                  <View style={styles.valorContainer}><Text style={styles.valorTexto}>{alturaTemp}</Text><Text style={styles.unidadeTexto}>cm</Text></View>

                  <TouchableOpacity onPress={() => setAlturaTemp(prev => Math.max((prev || 170) - 1, 100))} style={styles.botaoControle}><Text>-1</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setAlturaTemp(prev => Math.max((prev || 170) - 10, 100))} style={styles.botaoControle}><Text>-10</Text></TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => { setAltura(alturaTemp); setShowAlturaModal(false); }} style={styles.botaoFeito}>
                <Text style={styles.botaoFeitoTexto}>Feito</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Sexo modal */}
        <Modal animationType="slide" transparent visible={showSexoModal} onRequestClose={() => setShowSexoModal(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.bottomCardModal}>
              <Text style={styles.modalHeader}>Sexo</Text>
              <TouchableOpacity style={[styles.goalCard, sexo === "feminino" && styles.goalCardActive]} onPress={() => setSexo("feminino")}>
                <Text style={[styles.goalTitle, sexo === "feminino" && { color: "#fff" }]}>Feminino</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.goalCard, sexo === "masculino" && styles.goalCardActive]} onPress={() => setSexo("masculino")}>
                <Text style={[styles.goalTitle, sexo === "masculino" && { color: "#fff" }]}>Masculino</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoFeito, { marginTop: 12 }]} onPress={() => setShowSexoModal(false)}>
                <Text style={styles.botaoFeitoTexto}>Feito</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Date modal */}
        <Modal animationType="slide" transparent visible={showDateModal} onRequestClose={() => setShowDateModal(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.bottomCardModal}>
              <Text style={styles.modalHeader}>Data de Nascimento</Text>

              <TextInput
                placeholder="DD/MM/AAAA"
                value={dateInput}
                onChangeText={handleDateChange}
                style={[styles.input, { fontSize: 20, textAlign: "center" }]}
                keyboardType="numeric"
                maxLength={10}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
                <TouchableOpacity style={[styles.smallBtn, { paddingHorizontal: 18 }]} onPress={() => {
                  // convenience: today
                  const d = new Date();
                  const dd = String(d.getDate()).padStart(2, "0");
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const yyyy = d.getFullYear();
                  const txt = `${dd}/${mm}/${yyyy}`;
                  setDateInput(txt);
                }}>
                  <Text>Hoje</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.smallBtn, { paddingHorizontal: 18 }]} onPress={() => {
                  // convenience: clear
                  setDateInput("");
                }}>
                  <Text>Limpar</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.botaoFeito, { marginTop: 12 }]} onPress={validateAndSaveDate}>
                <Text style={styles.botaoFeitoTexto}>Salvar data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==========================
   Styles
   ========================== */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f2f2f2" },
  topBar: { height: 8, backgroundColor: "#EDE9F8", width: "100%" },
  progressFill: { height: 8, backgroundColor: "#2EA3FC" },
  page: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 30 },
  centerTitle: { fontSize: 24, fontWeight: "800", textAlign: "center", color: "#0e3f77", marginTop: 6, marginBottom: 16 },
  infoBox: { backgroundColor: "#fff", borderRadius: 16, padding: 8, marginTop: 8, elevation: 4 },

  // listRow like the register screen
  listRow: { backgroundColor: "#fff", marginVertical: 8, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderColor: "#C8E0FF", borderWidth: 1 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#C8E0FF", marginRight: 12, alignItems: "center", justifyContent: "center" },
  listLabel: { fontSize: 16, color: "#221F33", fontWeight: "700" },
  listValue: { fontSize: 16, color: "#6B6880" },

  row: { flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" },
  chipCard: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderColor: "#e5e7eb", borderWidth: 1, backgroundColor: "#fff", minWidth: 120, alignItems: "center" },
  cardActive: { backgroundColor: "#1e90ff", borderColor: "#1e90ff" },
  cardTitle: { fontWeight: "700", color: "#222" },
  input: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 6, fontSize: 16 },
  smallCard: { backgroundColor: "#fff", padding: 12, borderRadius: 12, minWidth: 110 },

  imcTextContainer: { justifyContent: "center", alignItems: "flex-start", flex: 1 }, imcCard: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 35,
    padding: 0,
    elevation: 6,
    height: 180,
    position: "relative", // permite mascote absoluto
    paddingLeft: 160,  // <-- AUMENTEI este valor
  },

  imcTextContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    height: "100%",
  },
  imcRow: { flexDirection: "row", alignItems: "center" },
  imcLabel: { color: "#8C8A9A", fontSize: 16, fontWeight: "500", alignSelf: "center", marginTop: 30, right: 10 },
  imcValue: { color: "#000000ff", fontSize: 30, fontWeight: "800", marginVertical: 2, left: 40, marginBottom: 20, bottom: 5 },
  imcRange: { color: "#8C8A9A", fontSize: 16, bottom: 20 },
  imcRangeValue: { color: "#000000ff", fontSize: 30, fontWeight: "800", bottom: 20, left: 0 },
  imcMascoteWrap: {
    position: "absolute",  // tira do fluxo do flex
    bottom: 0,             // fixa na parte inferior do card
    left: -10,               // fixa à esquerda
    width: 165,
    height: 160,           // corta parte de baixo
    overflow: "hidden",
  },

  imcMascote: {
    width: 200,
    height: 200,
  },

  weightValue: { fontSize: 28, fontWeight: "800", color: "#2EA3FC", marginBottom: 10, alignSelf: "center" },
  smallBtn: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, elevation: 2 },

  activityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 8, marginVertical: 8, paddingVertical: 16, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#C8E0FF" },
  activityRowActive: { backgroundColor: "#2EA3FC" },
  activityTitle: { fontSize: 18, fontWeight: "700", color: "#221F33" },
  activitySubtitle: { fontSize: 14, color: "#6B6880", marginTop: 2 },
  chev: { width: 10, height: 10, borderRightWidth: 2, borderBottomWidth: 2, borderColor: "#2EA3FC", transform: [{ rotate: "-45deg" }], marginRight: 6 },

  goalCard: { backgroundColor: "#fff", padding: 16, borderRadius: 20, marginVertical: 8, marginHorizontal: 8, borderWidth: 1, borderColor: "#f2f2f2" },
  goalCardActive: { backgroundColor: "#2EA3FC" },
  goalTitle: { fontSize: 18, fontWeight: "800" },
  goalSubtitle: { color: "#6b6b6b", marginTop: 6 },

  bottomBar: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 0 : 10,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: "#F6F3FB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0DDEE",
  },
  circleBack: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#2EA3FC", alignItems: "center", justifyContent: "center" },
  continueBtn: { flex: 1, marginLeft: 18, backgroundColor: "#2EA3FC", height: 56, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  continueText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  preview: { position: "absolute", left: 18, right: 18, bottom: 110, backgroundColor: "#add5fdff", borderRadius: 12, padding: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  previewTitle: { fontWeight: "700", marginBottom: 6, fontSize: 16 },
  previewLine: { fontSize: 13, marginBottom: 4 },

  // modal altura + sexo + date
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  bottomCardModal: { width: "100%", height: "50%", backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { fontSize: 22, fontWeight: "700", marginBottom: 10, alignSelf: "center" },
  modalContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 1, padding: 20 },
  controles: { alignItems: "center" },
  botaoControle: { padding: 6, marginVertical: 6, backgroundColor: "#E8F0FF", borderRadius: 8 },
  valorContainer: { width: 100, height: 64, backgroundColor: "#F7F7F7", borderRadius: 12, justifyContent: "center", alignItems: "center", marginVertical: 8 },
  valorTexto: { fontSize: 24, fontWeight: "800" },
  unidadeTexto: { fontSize: 12, color: "#666" },
  botaoFeito: { backgroundColor: "#2EA3FC", paddingVertical: 12, borderRadius: 20, alignItems: "center", marginTop: 12 },
  botaoFeitoTexto: { color: "white", fontSize: 16, fontWeight: "700" },

  saveBtn: { marginTop: 16, backgroundColor: "#1e90ff", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  /* novos/ajustados */
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // <- remove o fundo azul
  },
  rowLabel: {
    fontSize: 16,
    color: "#221F33",
    fontWeight: "700",
  },
  rowValue: {
    fontSize: 16,
    color: "#6B6880",
  },

  infoBox: {
    backgroundColor: "#ffffffff",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "95%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    top: 200
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#E4EAF5",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },

  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  infoValue: {
    fontSize: 16,
    color: "#6B6B6B",
  },
  weightPicker: { marginTop: 30, alignItems: "center" },
  weightValue: { fontSize: 48, fontWeight: "800", color: "#2EA3FC", marginBottom: 10 },
});
