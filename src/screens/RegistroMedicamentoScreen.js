import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";

// Variável global do som
let soundObject;

// Configuração do NotificationHandler atualizada
Notifications.setNotificationHandler({
    handleNotification: async () => {
        tocarAlarme(); // dispara junto com a notificação
        return {
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false, // usamos nosso som em loop
            shouldSetBadge: false,
        };
    },
});

// Função para tocar o alarme em loop
async function tocarAlarme() {
    try {
        soundObject = new Audio.Sound();
        await soundObject.loadAsync(require("../../assets/sounds/SoundSplashScreen.mp3")); // ajuste o caminho conforme necessário
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

export default function RegistroMedicamentoScreen() {
    const [medicamento, setMedicamento] = useState("");
    const [horario, setHorario] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [medicamentos, setMedicamentos] = useState([]);

    useEffect(() => {
        async function pedirPermissao() {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permissão necessária", "Ative as notificações nas configurações.");
            }
        }
        pedirPermissao();
    }, []);

    // Agendar notificação
    async function agendarNotificacao() {
        if (!medicamento) {
            Alert.alert("Erro", "Digite o nome do medicamento.");
            return;
        }

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Hora do medicamento!",
                    body: `Lembre-se de tomar: ${medicamento}`,
                },
                trigger: {
                    hour: horario.getHours(),
                    minute: horario.getMinutes(),
                    repeats: true, // diário
                },
            });

            const novo = {
                id,
                nome: medicamento,
                hora: horario.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMedicamentos([...medicamentos, novo]);
            setMedicamento(""); // limpa input
            Alert.alert("Sucesso", `Notificação para ${novo.nome} às ${novo.hora}`);
        } catch (e) {
            console.error("Erro ao agendar:", e);
            Alert.alert("Erro", "Não foi possível agendar a notificação.");
        }
    }

    // Cancelar notificação
    async function removerMedicamento(id) {
        await Notifications.cancelScheduledNotificationAsync(id);
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

            <Button title="Agendar Notificação" onPress={agendarNotificacao} />

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

            <Button title="Parar Alarme" onPress={pararAlarme} color="red" />
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
});
