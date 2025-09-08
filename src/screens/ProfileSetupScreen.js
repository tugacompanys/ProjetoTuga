import { useState, useMemo } from "react";
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // seu arquivo de configuração do Firebase
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

function mifflin({ sexo, pesoKg, alturaCm, idade }) {
    const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
    return sexo === "masculino" ? base + 5 : base - 161;
}

function buildPlan({ sexo, peso, altura, idade, atividade, objetivo }) {
    const pesoKg = Number(peso);
    const alturaCm = Number(altura);
    const idadeNum = Number(idade);
    const atividadeNum = Number(atividade);

    const bmr = mifflin({ sexo, pesoKg, alturaCm, idade: idadeNum });
    const tdee = bmr * atividadeNum;
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

    const perMeal = Object.fromEntries(
        Object.entries(MEALS_SPLIT).map(([refeicao, frac]) => [
            refeicao,
            {
                kcal: Math.round(kcal * frac),
                carbs_g: Math.round(macros.carbs_g * frac),
                protein_g: Math.round(macros.protein_g * frac),
                fat_g: Math.round(macros.fat_g * frac),
            },
        ])
    );

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), macros, perMeal };
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
        return buildPlan({ sexo, peso, altura, idade, atividade, objetivo });
    } catch {
        return null;
    }
}, [sexo, idade, peso, altura, atividade, objetivo]);


    async function handleSalvar() {
        if (!canPreview) {
            Alert.alert("Campos obrigatórios", "Preencha peso, altura, idade, sexo e atividade.");
            return;
        }

        const perfil = {
            sexo, idade: Number(idade), peso: Number(peso), altura: Number(altura),
            atividade: Number(atividade), objetivo, tipoDiabetes, medicamentos,
            updatedAt: Date.now(),
        };

        const plano = buildPlan(perfil);

        try {
            // Salva localmente
            await AsyncStorage.setItem("@user_profile", JSON.stringify(perfil));
            await AsyncStorage.setItem("@nutrition_plan", JSON.stringify(plano));

            // Salva no Firebase
            await addDoc(collection(db, "profiles"), { userId, perfil, plano, createdAt: Date.now() });

            Alert.alert("Pronto!", "Seu plano foi calculado e salvo.");

            // Navega para a tela de índice passando os dados recém-criados
            navigation.navigate("IndiceDiario", { userId, plano, novoPerfil: perfil });
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

            <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
                <Text style={styles.saveTxt}>Salvar plano</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Funções auxiliares
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
