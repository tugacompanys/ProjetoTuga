import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

export default function Configuracoes() {
  const navigation = useNavigation();

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [loginBiometrico, setLoginBiometrico] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(true);

  useEffect(() => {
    const carregarPreferenciaBiometria = async () => {
      try {
        const valorSalvo = await SecureStore.getItemAsync("usarBiometria");
        if (valorSalvo !== null) {
          setLoginBiometrico(valorSalvo === "true");
        }
      } catch (err) {
        console.log("Erro ao carregar biometria:", err);
      }
    };
    carregarPreferenciaBiometria();
  }, []);

  const toggleNotificacoes = () => setNotificacoesAtivas(!notificacoesAtivas);

  const toggleBiometria = async () => {
    try {
      const novoValor = !loginBiometrico;
      setLoginBiometrico(novoValor);
      await SecureStore.setItemAsync("usarBiometria", novoValor ? "true" : "false");

      if (!novoValor) {
        await SecureStore.deleteItemAsync("email");
        await SecureStore.deleteItemAsync("senha");
      }
    } catch (err) {
      console.log("Erro ao salvar biometria:", err);
      Alert.alert("Erro", "Não foi possível alterar a configuração de biometria.");
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      "Confirmar",
      "Deseja realmente excluir sua conta? Todos os dados serão perdidos.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => Alert.alert("Conta excluída") },
      ]
    );
  };

  const handleAbrirLink = (url) => Linking.openURL(url);

  const habilitarNotificacoes = () => {
    setNotificacoesAtivas(true);
    setMostrarPopup(false);
  };

  return (
    <ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 90 }}
>

      {/* Conta & Perfil */}
      <Text style={styles.secaoTitulo}>Conta e Perfil</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardItem} onPress={() => navigation.navigate("EditarPerfil")}>
          <Ionicons name="person-circle" size={25} color="#1e90ff" />
          <Text style={styles.cardItemTexto}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.cardItem}>
          <Ionicons name="notifications" size={25} color="#FFA500" />
          <Text style={styles.cardItemTexto}>Notificações</Text>
          <Switch value={notificacoesAtivas} onValueChange={toggleNotificacoes} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={() => Alert.alert("Backup realizado!")}>
          <Ionicons name="cloud-upload" size={24} color="#8A2BE2" />
          <Text style={styles.cardItemTexto}>Backup de Dados</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={handleExcluirConta}>
          <Ionicons name="trash" size={23} color="#FF3B30" />
          <Text style={[styles.cardItemTexto, { color: "#FF3B30" }]}>Excluir Conta</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Pop-up de Notificações */}
      {mostrarPopup && (
        <View style={styles.popup}>
          <Ionicons name="notifications" size={45} color="#FFA500" style={{ marginBottom: 10 }} />
          <Text style={styles.popupTexto}>
            Ative as notificações para melhor controle da sua diabete
          </Text>
          <TouchableOpacity style={styles.popupBotao} onPress={habilitarNotificacoes}>
            <Text style={styles.popupBotaoTexto}>Habilitar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Privacidade & Segurança */}
      <Text style={styles.secaoTitulo}>Privacidade e Segurança</Text>
      <View style={styles.card}>
        <View style={styles.cardItem}>
          <MaterialCommunityIcons name="fingerprint" size={25} color="#d5a77eff" />
          <Text style={styles.cardItemTexto}>Login Biométrico</Text>
          <Switch value={loginBiometrico} onValueChange={toggleBiometria} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={() => Alert.alert("Configurar tempo de sessão")}>
          <Ionicons name="time" size={25} color="#555" />
          <Text style={styles.cardItemTexto}>Sessão Segura</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Ajuda & Informações */}
      <Text style={styles.secaoTitulo}>Ajuda e Informações</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardItem} onPress={() => Alert.alert("Abrir FAQ")}>
          <Ionicons name="help-circle" size={25} color="#1E90FF" />
          <Text style={styles.cardItemTexto}>FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={() => handleAbrirLink("mailto:suporte@mygluco.com")}>
          <Ionicons name="mail" size={25} color="#20B2AA" />
          <Text style={styles.cardItemTexto}>Contato/Suporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={() => handleAbrirLink("https://mygluco.com/privacidade")}>
          <Ionicons name="document-text" size={25} color="#808080" />
          <Text style={styles.cardItemTexto}>Política de Privacidade / Termos</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.cardItem} onPress={() => Alert.alert("Versão 1.0.0\nEquipe MyGluco")}>
          <Ionicons name="information-circle" size={25} color="#9370DB" />
          <Text style={styles.cardItemTexto}>Sobre o App</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 14,
    paddingBottom: 150,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 10,
    color: "#444",
    left: 10
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardItemTexto: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 12,
  },
  popup: {
    backgroundColor: "#f1fceb",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginVertical: 10,
  },
  popupTexto: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  popupBotao: {
    backgroundColor: "#8dd067",
    paddingVertical: 13,
    paddingHorizontal: 120,
    borderRadius: 8,
  },
  popupBotaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
