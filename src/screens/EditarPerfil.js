import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../config/firebaseConfig";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";

export default function EditProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [image, setImage] = useState(
    user?.photoURL || "https://cdn-icons-png.flaticon.com/512/147/147142.png"
  );
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [field, setField] = useState("");

  const openModal = (type) => {
    setField(type);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("É necessário permitir acesso à galeria!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    if (password && password.length < 8) {
      Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      await updateProfile(user, { displayName: name, photoURL: image });

      if (email !== user.email) await updateEmail(user, email);
      if (password) await updatePassword(user, password);

      Alert.alert("Sucesso", "Perfil atualizado!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um problema ao atualizar seu perfil.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Sobre Você</Text>

        {/* espaço para alinhar */}
        <View style={{ width: 28 }} />
      </View>

      {/* Avatar */}
      <View style={styles.Body}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: image }} style={styles.avatar} />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Caixinha */}
        <View style={styles.infoBox}>

          {/* Nome */}
          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.8}
            onPress={() => openModal("name")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
              <Ionicons name="person-circle" size={22} color="#1e90ff" style={{ marginRight: 12 }} />
              <Text style={styles.infoLabel}>Nome</Text>
            </View>
            <Text style={styles.infoValue}>{name || "Adicionar"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.8}
            onPress={() => openModal("email")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#5b8cff" style={{ marginRight: 12 }} />
              <Text style={styles.infoLabel}>E-mail</Text>
            </View>
            <Text style={styles.infoValue}>{email}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" />
          </TouchableOpacity>

          {/* Senha */}
          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.8}
            onPress={() => openModal("password")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
              <Ionicons name="lock-closed" size={22} color="#32CD32" style={{ marginRight: 12 }} />
              <Text style={styles.infoLabel}>Nova Senha</Text>
            </View>
            <Text style={styles.infoValue}>{password ? "••••••" : "Adicionar"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" />
          </TouchableOpacity>

          {/* Confirmar Senha */}
          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.8}
            onPress={() => openModal("confirm")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", width: 150 }}>
              <Ionicons name="checkmark-circle" size={22} color="#ffa500" style={{ marginRight: 12 }} />
              <Text style={styles.infoLabel}>Confirmar Senha</Text>
            </View>
            <Text style={styles.infoValue}>{confirmPassword ? "••••••" : "Adicionar"}</Text>
            <Ionicons name="chevron-forward" size={20} color="#C8E0FF" />
          </TouchableOpacity>
        </View>

        {/* Botões */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TextInput
              style={styles.modalInput}
              placeholder={
                field === "name"
                  ? "Nome"
                  : field === "email"
                  ? "E-mail"
                  : field === "password"
                  ? "Nova senha"
                  : "Confirmar senha"
              }
              secureTextEntry={field.includes("password")}
              value={
                field === "name"
                  ? name
                  : field === "email"
                  ? email
                  : field === "password"
                  ? password
                  : confirmPassword
              }
              onChangeText={(v) =>
                field === "name"
                  ? setName(v)
                  : field === "email"
                  ? setEmail(v)
                  : field === "password"
                  ? setPassword(v)
                  : setConfirmPassword(v)
              }
            />

            <TouchableOpacity
              style={styles.modalSave}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalSaveText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2f2" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  Body: { paddingVertical: 80 },

  avatarContainer: { alignItems: "center", marginTop: 5 },

  avatar: {
    width: 150,
    height: 150,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#fff",
  },

  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 130,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  infoLabel: { fontSize: 16, fontWeight: "700", color: "#221F33" },
  infoValue: { fontSize: 16, color: "#6B6880" },

  saveButton: {
    backgroundColor: "#1e90ff",
    marginHorizontal: 50,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 100,
  },

  saveText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  cancelText: {
    textAlign: "center",
    color: "#1e90ff",
    fontSize: 16,
    marginTop: 15,
    marginBottom: 30,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 20,
    padding: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },

  modalSave: {
    backgroundColor: "#1e90ff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  modalSaveText: { color: "#fff", fontWeight: "bold" },
});
