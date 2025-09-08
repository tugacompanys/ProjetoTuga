import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert
} from "react-native";
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
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function distributeInteger(total, fractions) {
  const roundedTotal = Math.round(total);
  const entries = Object.entries(fractions);
  const exact = entries.map(([k, frac]) => ({ k, frac, exact: roundedTotal * frac }));
  const floored = exact.map(e => Math.floor(e.exact));
  let sumFloored = floored.reduce((s, v) => s + v, 0);
  let remainder = roundedTotal - sumFloored;
  const fracParts = exact.map((e, i) => ({ idx: i, part: e.exact - Math.floor(e.exact) }));
  fracParts.sort((a, b) => b.part - a.part);
  const allocated = floored.slice();
  let i = 0;
  while (remainder > 0 && i < fracParts.length) {
    allocated[fracParts[i].idx] += 1;
    remainder--;
    i++;
  }
  i = 0;
  while (remainder > 0) {
    allocated[i % allocated.length] += 1;
    remainder--;
    i++;
  }
  const result = {};
  entries.forEach((entry, idx) => {
    result[entry[0]] = allocated[idx];
  });
  return result;
}

function mifflin({ sexo, pesoKg, alturaCm, idade }) {
    const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
    return sexo === "masculino" ? base + 5 : base - 161;
}

function buildPlan({ sexo, peso, altura, idade, atividade, objetivo }) {
  // trata entradas (aceita strings com vírgula)
  const pesoKg = toNumber(peso);
  const alturaCm = toNumber(altura);
  const idadeNum = toNumber(idade);
  const atividadeNum = toNumber(atividade);

  if (!Number.isFinite(pesoKg) || !Number.isFinite(alturaCm) || !Number.isFinite(idadeNum) || !Number.isFinite(atividadeNum)) {
    throw new Error("Valores numéricos inválidos para peso/altura/idade/atividade.");
  }

  const bmrRaw = mifflin({ sexo, pesoKg, alturaCm, idade: idadeNum });
  const tdeeRaw = bmrRaw * atividadeNum;
  const goalAdj = GOALS.find(g => g.value === objetivo)?.adj ?? 0;
  const kcal = Math.max(1200, Math.round(tdee + goalAdj));

    const carbsKcal = kcal * MACROS_PCT.carbs;
    const proteinKcal = kcal * MACROS_PCT.protein;
    const fatKcal = kcal * MACROS_PCT.fat;

    const macros = {
        kcal,
        carbs_g: Math.round(carbsKcal / 4),
        protein_g: Math.round(proteinKcal / 4),
        fat_g: Math.round(fatKcal / 9),
    };

  // Distribuir por refeição garantindo soma correta
  const perMealKcal = distributeInteger(kcal, MEALS_SPLIT);
  const perMealCarbs = distributeInteger(macros.carbs_g, MEALS_SPLIT);
  const perMealProtein = distributeInteger(macros.protein_g, MEALS_SPLIT);
  const perMealFat = distributeInteger(macros.fat_g, MEALS_SPLIT);

  const perMeal = Object.fromEntries(
    Object.keys(MEALS_SPLIT).map((key) => ([key, {
      kcal: perMealKcal[key],
      carbs_g: perMealCarbs[key],
      protein_g: perMealProtein[key],
      fat_g: perMealFat[key],
    }] ))
  );

  return { bmr, tdee, macros, perMeal };
}

export default function ProfileSetupScreen({ navigation, route }) {
    const [sexo, setSexo] = useState("feminino");
    const [idade, setIdade] = useState("");
    const [peso, setPeso] = useState("");
    const [altura, setAltura] = useState("");
    const [atividade, setAtividade] = useState(ACTIVITY[0].value.toString());
    const [objetivo, setObjetivo] = useState("manter");
    const [tipoDiabetes, setTipoDiabetes] = useState("nenhum");
    const [medicamentos, setMedicamentos] = useState("");

    const userId = route?.params?.user?.uid || "user-test";

    const canPreview = sexo && idade && peso && altura && atividade && objetivo;

    const preview = useMemo(() => {
    if (!sexo || !idade || !peso || !altura || !atividade || !objetivo) {
        return null; // só impede se algum campo estiver vazio
    }
    try {
<<<<<<< HEAD
        return buildPlan({ sexo, peso, altura, idade, atividade, objetivo });
    } catch {
        return null;
=======
      return buildPlan({ sexo, peso, altura, idade, atividade, objetivo });
    } catch {
      return null;
>>>>>>> 0777315ee8ffb68e29175f6f290cf5d835c22ee5
    }
}, [sexo, idade, peso, altura, atividade, objetivo]);


    async function handleSalvar() {
        if (!canPreview) {
            Alert.alert("Campos obrigatórios", "Preencha peso, altura, idade, sexo e atividade.");
            return;
        }

    const perfil = {
      sexo,
      idade: toNumber(idade),
      peso: toNumber(peso),
      altura: toNumber(altura),
      atividade: toNumber(atividade),
      objetivo,
      tipoDiabetes,
      medicamentos,
      updatedAt: Date.now(),
    };

    let plano;
    try {
      plano = buildPlan(perfil);
    } catch (err) {
      Alert.alert("Erro", "Valores numéricos inválidos. Verifique os campos.");
      return;
    }

    try {
      await AsyncStorage.setItem("@user_profile", JSON.stringify(perfil));
      await AsyncStorage.setItem("@nutrition_plan", JSON.stringify(plano));

      await addDoc(collection(db, "profiles"), { userId, perfil, plano, createdAt: Date.now() });

      Alert.alert("Pronto!", "Seu plano foi calculado e salvo.");
      navigation.navigate("IndiceDiario", { userId, plano });
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Seu Perfil</Text>

            <Text style={styles.label}>Sexo</Text>
            <View style={styles.row}>
                {["feminino", "masculino"].map(opt => (
                    <Chip key={opt} active={sexo === opt} onPress={() => setSexo(opt)} label={opt} />
                ))}
            </View>

            <View style={styles.grid}>
                <Field label="Idade" value={idade} onChangeText={setIdade} placeholder="anos" keyboardType="numeric" />
                <Field label="Peso" value={peso} onChangeText={setPeso} placeholder="kg" keyboardType="numeric" />
                <Field label="Altura" value={altura} onChangeText={setAltura} placeholder="cm" keyboardType="numeric" />
            </View>

      <Text style={styles.label}>Nível de atividade</Text>
      <View style={styles.column}>
        {ACTIVITY.map(a => (
          <Chip
            key={a.value}
            active={atividade === a.value.toString()}
            onPress={() => setAtividade(a.value.toString())}
            label={`${a.label}  (x${a.value})`}
          />
        ))}
      </View>

            <Text style={styles.label}>Objetivo</Text>
            <View style={styles.row}>
                {GOALS.map(g => (
                    <Chip key={g.value} active={objetivo === g.value} onPress={() => setObjetivo(g.value)} label={g.label} />
                ))}
            </View>

            <Text style={styles.label}>Tipo de diabetes</Text>
            <View style={styles.rowWrap}>
                {["nenhum", "tipo 1", "tipo 2", "gestacional", "outro"].map(t => (
                    <Chip key={t} active={tipoDiabetes === t} onPress={() => setTipoDiabetes(t)} label={t} />
                ))}
            </View>

<<<<<<< HEAD
            <Field label="Medicamentos (opcional)" value={medicamentos} onChangeText={setMedicamentos} placeholder="Insulina, metformina, etc." multiline />
=======
      <View style={styles.grid}>
        <Field label="Idade" value={idade} onChangeText={setIdade} placeholder="anos" keyboardType="numeric" />
        <Field label="Peso" value={peso} onChangeText={setPeso} placeholder="kg (ex: 72 ou 72,5)" keyboardType="numeric" />
        <Field label="Altura" value={altura} onChangeText={setAltura} placeholder="cm (ex: 175)" keyboardType="numeric" />
      </View>
>>>>>>> 0777315ee8ffb68e29175f6f290cf5d835c22ee5

            {preview && (
                <View style={styles.preview}>
                    <Text style={styles.previewTitle}>Prévia do Plano</Text>
                    <Text style={styles.previewLine}>BMR: {preview.bmr} kcal</Text>
                    <Text style={styles.previewLine}>TDEE: {preview.tdee} kcal</Text>
                    <Text style={styles.previewLine}>
                        Meta diária: {preview.macros.kcal} kcal — C:{preview.macros.carbs_g}g · P:{preview.macros.protein_g}g · G:{preview.macros.fat_g}g
                    </Text>

                    <View style={{ marginTop: 8 }}>
                        {Object.entries(preview.perMeal).map(([ref, v]) => (
                            <Text key={ref} style={styles.previewLine}>
                                {labelMeal(ref)} → {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g
                            </Text>
                        ))}
                    </View>

                    {/* Botão de navegação direto */}
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: "#34d399", marginTop: 8 }]}
                        onPress={() => {
                            navigation.navigate("IndiceDiario", { userId, plano: preview });
                        }}
                    >
                        <Text style={styles.saveTxt}>Ir para Índice Diário</Text>
                    </TouchableOpacity>
                </View>
            )}

<<<<<<< HEAD
            <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
                <Text style={styles.saveTxt}>Salvar plano</Text>
            </TouchableOpacity>
        </ScrollView>
    );
=======
      <Field label="Medicamentos (opcional)" value={medicamentos} onChangeText={setMedicamentos} placeholder="Insulina, metformina, etc." multiline />

      {preview && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Prévia do Plano</Text>
          <Text style={styles.previewLine}>BMR: {preview.bmr} kcal</Text>
          <Text style={styles.previewLine}>TDEE: {preview.tdee} kcal</Text>
          <Text style={styles.previewLine}>
            Meta diária: {preview.macros.kcal} kcal — C:{preview.macros.carbs_g}g · P:{preview.macros.protein_g}g · G:{preview.macros.fat_g}g
          </Text>

          <View style={{ marginTop: 8 }}>
            {Object.entries(preview.perMeal).map(([ref, v]) => (
              <Text key={ref} style={styles.previewLine}>
                {labelMeal(ref)} → {v.kcal} kcal · C:{v.carbs_g}g · P:{v.protein_g}g · G:{v.fat_g}g
              </Text>
            ))}
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#34d399", marginTop: 8 }]} onPress={() => navigation.navigate("IndiceDiario", { userId, plano: preview })}>
            <Text style={styles.saveTxt}>Ir para Índice Diário</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
        <Text style={styles.saveTxt}>Salvar plano</Text>
      </TouchableOpacity>
    </ScrollView>
  );
>>>>>>> 0777315ee8ffb68e29175f6f290cf5d835c22ee5
}

function labelMeal(key) {
    switch (key) {
        case "cafe": return "Café da manhã";
        case "almoco": return "Almoço";
        case "jantar": return "Jantar";
        case "lanche": return "Lanche/Ceia";
        default: return key;
    }
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, props.multiline && { height: 90, textAlignVertical: "top" }]}
        placeholderTextColor="#8a8a8a"
      />
    </View>
  );
}

function Chip({ label, active, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 6 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, color: "#222" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  rowWrap: { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  column: { gap: 8, marginBottom: 8 },
  grid: { flexDirection: "row", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#1e90ff20", borderColor: "#1e90ff" },
  chipTxt: { fontWeight: "600", color: "#374151" },
  chipTxtActive: { color: "#1e90ff" },
  preview: { marginTop: 10, backgroundColor: "#f1f5f9", borderRadius: 12, padding: 12 },
  previewTitle: { fontWeight: "700", marginBottom: 4 },
  previewLine: { fontSize: 14, marginBottom: 2 },
  saveBtn: { marginTop: 12, backgroundColor: "#1e90ff", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
