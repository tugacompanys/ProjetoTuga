// ProfileSetupScreen.js
import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ToastAndroid, Image, Pressable, Animated } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVITY = [
  { label: "Sedentário", value: 1.2 },
  { label: "Leve (1-3x/sem)", value: 1.375 },
  { label: "Moderado (3-5x/sem)", value: 1.55 },
  { label: "Intenso (6-7x/sem)", value: 1.725 },
  { label: "Atleta", value: 1.9 },
];
const GOALS = [
  { label: "Manter", value: "manter", adj: 0 },
  { label: "Perder", value: "perder", adj: -300 },
  { label: "Ganhar", value: "ganhar", adj: 300 },
];
const MACROS_PCT = { carbs: 0.5, protein: 0.2, fat: 0.3 };
const MEALS_SPLIT = { cafe: 0.25, almoco: 0.35, jantar: 0.3, lanche: 0.1 };

function toNumber(v) {
  const n = Number(String(v).trim().replace(",", "."));
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

export default function ProfileSetupScreen({ navigation, route }) {
  const [step, setStep] = useState(1);
  const [sexo, setSexo] = useState("feminino");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [atividade, setAtividade] = useState(ACTIVITY[0].value.toString());
  const [objetivo, setObjetivo, plano] = useState("manter");
  const [tipoDiabetes, setTipoDiabetes] = useState("nenhum");
  const [medicamentos, setMedicamentos] = useState("");
  const userId = route?.params?.user?.uid || "user-test";
  const canPreview = sexo && idade && peso && altura && atividade && objetivo;

  const preview = useMemo(() => canPreview ? buildPlan({ sexo, peso, altura, idade, atividade, objetivo }) : null, [sexo, idade, peso, altura, atividade, objetivo]);

  async function handleSalvar() {
    if (!canPreview) { Alert.alert("Preencha todos os campos obrigatórios."); return; }
    try {
      const perfil = { sexo, idade: toNumber(idade), peso: toNumber(peso), altura: toNumber(altura), atividade: toNumber(atividade), objetivo, tipoDiabetes, medicamentos, updatedAt: Date.now() };
      const plano = buildPlan(perfil);

      await AsyncStorage.setItem("@user_profile", JSON.stringify(perfil));
      await AsyncStorage.setItem("@nutrition_plan", JSON.stringify(plano));
      await addDoc(collection(db, "profiles"), { userId, perfil, plano, createdAt: serverTimestamp() });
      await addDoc(collection(db, "users", userId, "historico"), { plano, macros: plano.macros, perMeal: plano.perMeal, createdAt: serverTimestamp() });

      ToastAndroid.show("Plano salvo com sucesso!", ToastAndroid.SHORT);
      navigation.replace("IndiceDiario", { userId, plano });
    } catch (e) { console.error(e); Alert.alert("Erro ao salvar os dados."); }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("../../assets/tuga_prancheta.png")} style={styles.icon} />
      <Text style={styles.title}>Seu Perfil Nutricional</Text>

      {step === 1 && <>
        <Text style={styles.label}>Sexo</Text>
        <View style={styles.row}>{["feminino","masculino"].map(opt=><Chip key={opt} active={sexo===opt} onPress={()=>setSexo(opt)} label={opt}/> )}</View>
        <View style={styles.grid}>
          <Field label="Idade" value={idade} onChangeText={setIdade} placeholder="anos" keyboardType="numeric"/>
          <Field label="Peso" value={peso} onChangeText={setPeso} placeholder="kg" keyboardType="numeric"/>
          <Field label="Altura" value={altura} onChangeText={setAltura} placeholder="cm" keyboardType="numeric"/>
        </View>
        <Pressable style={({pressed})=>[styles.nextBtn, pressed&&styles.btnPressed]} onPress={()=>setStep(2)}>
          <Text style={styles.nextTxt}>Próximo →</Text>
        </Pressable>
      </>}

      {step === 2 && <>
        <Text style={styles.label}>Nível de atividade</Text>
        <View style={styles.column}>{ACTIVITY.map(a=><Chip key={a.value} active={atividade===a.value.toString()} onPress={()=>setAtividade(a.value.toString())} label={a.label}/> )}</View>
        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.row}>{GOALS.map(g=><Chip key={g.value} active={objetivo===g.value} onPress={()=>setObjetivo(g.value)} label={g.label}/> )}</View>
        <Pressable style={({pressed})=>[styles.nextBtn, pressed&&styles.btnPressed]} onPress={()=>setStep(3)}>
          <Text style={styles.nextTxt}>Próximo →</Text>
        </Pressable>
      </>}

      {step === 3 && <>
        <Text style={styles.label}>Tipo de diabetes</Text>
        <View style={styles.rowWrap}>{["nenhum","tipo 1","tipo 2","gestacional","outro"].map(t=><Chip key={t} active={tipoDiabetes===t} onPress={()=>setTipoDiabetes(t)} label={t}/> )}</View>
        <Field label="Medicamentos (opcional)" value={medicamentos} onChangeText={setMedicamentos} placeholder="Insulina, metformina..." multiline/>
        <Pressable style={({pressed})=>[styles.saveBtn, pressed&&styles.btnPressed]} onPress={handleSalvar}>
          <Text style={styles.saveTxt} onPress={() => navigation.navigate("IndiceDiario", { userId, plano })}>💾 Salvar plano</Text>
        </Pressable>
      </>}

      {preview && <View style={styles.preview}>
        <Text style={styles.previewTitle}>Prévia do Plano</Text>
        <Text style={styles.previewLine}>BMR: {preview.bmr} kcal</Text>
        <Text style={styles.previewLine}>TDEE: {preview.tdee} kcal</Text>
        <Text style={styles.previewLine}>Meta diária: {preview.macros.kcal} kcal — C:{preview.macros.carbs_g}g · P:{preview.macros.protein_g}g · G:{preview.macros.fat_g}g</Text>
        {Object.entries(preview.perMeal).map(([ref,v])=><Text key={ref} style={styles.previewLine}>{labelMeal(ref)} → {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g</Text>)}
      </View>}
    </ScrollView>
  );
}

function Field({ label, ...props }) { return (<View style={{ marginBottom:12, flex:1 }}><Text style={styles.label}>{label}</Text><TextInput {...props} style={[styles.input, props.multiline && { height:90, textAlignVertical:"top" }]} placeholderTextColor="#8a8a8a"/></View>); }
function Chip({ label, active, onPress }) {
  const scale = new Animated.Value(1);
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform:[{scale}] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.chip, active&&styles.chipActive]}>
        <Text style={[styles.chipTxt, active&&styles.chipTxtActive]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
function labelMeal(key){switch(key){case"cafe":return"Café da manhã";case"almoco":return"Almoço";case"jantar":return"Jantar";case"lanche":return"Lanche/Ceia";default:return key;}}

const styles = StyleSheet.create({
  container:{padding:20,gap:12, backgroundColor:"#f0f8ff"},
  title:{fontSize:28,fontWeight:"800",marginBottom:16,color:"#0e3f77",textAlign:"center"},
  label:{fontSize:16,fontWeight:"600",marginBottom:6,color:"#222"},
  input:{backgroundColor:"#fff",borderWidth:1,borderColor:"#e5e7eb",borderRadius:16,paddingHorizontal:16,paddingVertical:14,fontSize:16, shadowColor:"#000", shadowOpacity:0.05, shadowOffset:{width:0,height:2}, shadowRadius:6},
  row:{flexDirection:"row",gap:8,marginBottom:8,flexWrap:"wrap"},
  rowWrap:{flexDirection:"row",gap:8,marginBottom:8,flexWrap:"wrap"},
  column:{gap:8,marginBottom:8},
  grid:{flexDirection:"row",gap:8,marginBottom:4},
  chip:{paddingHorizontal:14,paddingVertical:10,borderRadius:9999,borderWidth:1,borderColor:"#d1d5db",backgroundColor:"#fff", shadowColor:"#000", shadowOpacity:0.05, shadowOffset:{width:0,height:2}, shadowRadius:6},
  chipActive:{backgroundColor:"#1e90ff20",borderColor:"#1e90ff"},
  chipTxt:{fontWeight:"600",color:"#374151"},
  chipTxtActive:{color:"#1e90ff"},
  preview:{marginTop:16,backgroundColor:"#add5fdff",borderRadius:16,padding:16, shadowColor:"#000", shadowOpacity:0.08, shadowOffset:{width:0,height:4}, shadowRadius:12},
  previewTitle:{fontWeight:"700",marginBottom:6,fontSize:18},
  previewLine:{fontSize:14,marginBottom:4},
  saveBtn:{marginTop:16,backgroundColor:"#1e90ff",paddingVertical:16,borderRadius:16,alignItems:"center", shadowColor:"#000", shadowOpacity:0.08, shadowOffset:{width:0,height:4}, shadowRadius:8},
  saveTxt:{color:"#fff",fontWeight:"700",fontSize:16},
  nextBtn:{marginTop:16,backgroundColor:"#34d399",paddingVertical:16,borderRadius:16,alignItems:"center", shadowColor:"#000", shadowOpacity:0.08, shadowOffset:{width:0,height:4}, shadowRadius:8},
  nextTxt:{color:"#fff",fontWeight:"700",fontSize:16},
  btnPressed:{opacity:0.8, transform:[{scale:0.97}]},
  icon:{width:100,height:100,alignSelf:"center",marginBottom:16},
});
