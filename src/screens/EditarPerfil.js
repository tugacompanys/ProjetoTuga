import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../config/firebaseConfig";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";

export default function EditProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [image, setImage] = useState(user?.photoURL || "https://cdn-icons-png.flaticon.com/512/147/147142.png");
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Atualiza a foto de perfil
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("É necessário permitir o acesso à galeria!");
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

  // Salvar alterações no Firebase
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
      // Atualiza nome e foto
      await updateProfile(user, {
        displayName: name,
        photoURL: image,
      });

      // Atualiza email se mudou
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Atualiza senha se o usuário digitou nova
      if (password) {
        await updatePassword(user, password);
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um problema ao atualizar seu perfil.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" 
        size={26} 
        color="#fff"
        top={15} 
        onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Editar Perfil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.Body}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: image }} style={styles.avatar} />
        <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Formulário */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {/* Botões */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Salvar Alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff"
  },

header: {
    backgroundColor: "#1e90ff",
    flexDirection: "row",
    justifyContent: "evenly",
    paddingVertical: 36,
    paddingHorizontal: 20
  },
  
  Body: {
    paddingVertical: 80
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    top: 15
  },

  avatarContainer: {
    alignItems: "center",
    marginTop: 30,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 130,
    backgroundColor: "#1e90ff",
    borderRadius: 20,
    padding: 6,
  },

  form: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  input: {
    backgroundColor: "#dee8ecff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#1e90ff",
    marginHorizontal: 50,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },

  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  cancelText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    marginTop: 15,
    marginBottom: 30,
  },
});