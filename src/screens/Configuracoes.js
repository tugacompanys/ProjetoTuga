import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

export default function Configuracoes() {
  const navigation = useNavigation();

  // Estados para switches
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [loginBiometrico, setLoginBiometrico] = useState(false);

  const toggleNotificacoes = () => setNotificacoesAtivas(!notificacoesAtivas);
  const toggleTema = () => setTemaEscuro(!temaEscuro);

  // Quando o usuário ativar/desativar:
  const toggleBiometria = async () => {
    const valorAtual = await SecureStore.getItemAsync('usarBiometria');
    const novoValor = valorAtual === 'true' ? 'false' : 'true';
    await SecureStore.setItemAsync('usarBiometria', novoValor);
  
    if (novoValor === 'false') {
      // Remove credenciais salvas para segurança
      await SecureStore.deleteItemAsync('email');
      await SecureStore.deleteItemAsync('senha');
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

  

  return (
    <ScrollView style={styles.container}>

      {/* Seção: Conta & Perfil */}
      <Text style={styles.secaoTitulo}>⚙️ Conta & Perfil</Text>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("EditarPerfil")}>
        <Ionicons name="person-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Editar Perfil</Text>
      </TouchableOpacity>

      <View style={styles.item}>
        <Ionicons name="notifications-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Notificações</Text>
        <Switch value={notificacoesAtivas} onValueChange={toggleNotificacoes} />
      </View>

      <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Backup realizado!")}>
        <Ionicons name="cloud-upload-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Backup de Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={handleExcluirConta}>
        <Ionicons name="trash-outline" size={24} color="red" />
        <Text style={[styles.itemTexto, { color: "red" }]}>Excluir Conta</Text>
      </TouchableOpacity>

      {/* Seção: Personalização */}
      <Text style={styles.secaoTitulo}>🎨 Personalização</Text>

      <View style={styles.item}>
        <Ionicons name="color-palette-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Tema Escuro</Text>
        <Switch value={temaEscuro} onValueChange={toggleTema} />
      </View>

      <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Selecionar idioma")}>
        <Ionicons name="globe-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Idioma</Text>
      </TouchableOpacity>

      {/* Seção: Privacidade & Segurança */}
      <Text style={styles.secaoTitulo}>🔒 Privacidade & Segurança</Text>

      <View style={styles.item}>
        <MaterialCommunityIcons name="fingerprint" size={24} color="#000" />
        <Text style={styles.itemTexto}>Login Biométrico</Text>
        <Switch value={loginBiometrico} onValueChange={toggleLoginBiometrico} />
      </View>

      <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Configurar tempo de sessão")}>
        <Ionicons name="time-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Sessão Segura</Text>
      </TouchableOpacity>

      {/* Seção: Ajuda & Informações */}
      <Text style={styles.secaoTitulo}>💡 Ajuda & Informações</Text>

      <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Abrir FAQ")}>
        <Ionicons name="help-circle-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>FAQ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleAbrirLink("mailto:suporte@mygluco.com")}>
        <Ionicons name="mail-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Contato/Suporte</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleAbrirLink("https://mygluco.com/privacidade")}>
        <Ionicons name="document-text-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Política de Privacidade / Termos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.item, { marginBottom: 30 }]} onPress={() => Alert.alert("Versão 1.0.0\nEquipe MyGluco")}>
        <Ionicons name="information-circle-outline" size={24} color="#000" />
        <Text style={styles.itemTexto}>Sobre o App</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 14,
    paddingBottom: 80,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#444",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemTexto: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});
