import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../utils/firebase';

/* ---------- Type ---------- */
interface Article {
  id: string;
  titre: string;
  auteur: string;
  contenu: string;
  date_publication_article: any;   // Timestamp
  url: string;
  categorie: string;
  id_entreprise: string;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  /* --- fetch --- */
  useEffect(() => {
    const fetchArticles = async () => {
      const snap = await getDocs(collection(db, 'article'));
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Article[]);
    };
    fetchArticles();
  }, []);

  /* --- catégories distinctes --- */
  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.categorie))).filter(Boolean),
    [articles]
  );

  /* --- filtre --- */
  const visible = selectedCat === 'ALL'
    ? articles
    : articles.filter((a) => a.categorie === selectedCat);

  /* --- carte --- */
  const renderItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/[id]', params: { id: item.id } })}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{item.titre}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>🖋️</Text>
          <Text style={styles.value}>{item.auteur}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>📅</Text>
          <Text style={styles.value}>
            {new Date(item.date_publication_article.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>🏷️</Text>
          <Text style={styles.value}>{item.categorie}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* -------- filtre catégorie -------- */}
      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>Catégorie :</Text>
        <Picker
          selectedValue={selectedCat}
          onValueChange={(value: string) => setSelectedCat(value)}
          style={styles.picker}
        >
          <Picker.Item label="Toutes" value="ALL" />
          {categories.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 90 }}
      />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  /* filtre */
  filterBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filterLabel: { fontWeight: '600', marginRight: 8, color: '#007CB0' },
  picker: { flex: 1, height: 40 },

  card: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 6,
    borderLeftColor: '#007CB0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007CB0',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 16, width: 28 },
  value: { fontSize: 15, color: '#333' },
});
