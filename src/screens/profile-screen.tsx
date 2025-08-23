import { SafeAreaView, View, StyleSheet, Alert } from 'react-native';
import { Card, Button, Text } from '@ant-design/react-native';
import { COLORS } from '../consts/colors';
import { useAuth } from '../contexts/auth-context';
import { showLogoutConfirm } from '../utils/notifications';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    showLogoutConfirm(async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Профиль пользователя</Text>
        </View>

        <Text style={styles.label}>Имя</Text>
        <Text style={styles.value}>{user?.name || '—'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || '—'}</Text>

        <Text style={styles.label}>Роль</Text>
        <Text style={styles.value}>{user?.role?.label}</Text>

        <Text style={styles.label}>Телефон</Text>
        <Text style={styles.value}>{user?.phone || '—'}</Text>

        <Text style={styles.label}>Контрагент</Text>
        <Text style={styles.value}>{user?.counterparty?.name || '—'}</Text>
      </Card>

      <View style={styles.buttonWrapper}>
        <Button type="warning" onPress={handleLogout} style={styles.logoutBtn}>
          Выйти
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 16,
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  buttonWrapper: {
    marginHorizontal: 16,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#FF4D4F',
  },
});

export default ProfileScreen;
