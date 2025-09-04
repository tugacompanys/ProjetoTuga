import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndiceDiarioScreen({ route }) {
    const { userId, plano, userProfile: profileFromParams } = route.params || {};
    const [userProfile, setUserProfile] = useState(profileFromParams || null);

    useEffect(() => {
        if (!userProfile && userId) {
            const loadUserProfile = async () => {
                try {
                    const profileData = await AsyncStorage.getItem(`@user_profile_${userId}`);
                    if (profileData) {
                        setUserProfile(JSON.parse(profileData));
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados do perfil:', error);
                }
            };
            loadUserProfile();
        }
    }, [userId, userProfile]);

    return (
        <ScrollView style={{ padding: 20 }}>
            {userProfile && (
                <>
                    <Text>Nome: {userProfile.name}</Text>
                    <Text>Idade: {userProfile.age} anos</Text>
                    <Text>Peso: {userProfile.weight} kg</Text>
                    <Text>Altura: {userProfile.height} cm</Text>
                </>
            )}
            <Text>BMR: {plano?.bmr}</Text>
            <Text>TDEE: {plano?.tdee}</Text>
        </ScrollView>
    );
}
