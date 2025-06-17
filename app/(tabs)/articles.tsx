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
  date_publication_article: any;
  url: string;
  categorie: string;
  id_entreprise: string;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  useEffect(() => {
    const fetchArticles = async () => {
      const snap = await getDocs(collection(db, 'article'));
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Article[]);
    };
    fetchArticles();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.categorie))).filter(Boolean),
    [articles]
  );

  const visible = selectedCat === 'ALL'
    ? articles
    : articles.filter((a) => a.categorie === selectedCat);

  const renderItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/[id]', params: { id: item.id } })}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.titre}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>🖋️</Text>
          <Text style={styles.metaText}>{item.auteur}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>
            {new Date(item.date_publication_article.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>🏷️</Text>
          <Text style={styles.metaText}>{item.categorie}</Text>
        </View>

        <View style={styles.previewBox}>
          <Text numberOfLines={3} style={styles.previewText}>
            {item.contenu}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>Catégorie :</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCat}
            onValueChange={(value: string) => setSelectedCat(value)}
            style={styles.picker}
            dropdownIconColor="#007CB0"
          >
            <Picker.Item label="Toutes" value="ALL" />
            {categories.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007CB0',
    marginBottom: 15,
    textAlign: 'center',
  },

  filterBox: {
    marginBottom: 20,
    backgroundColor: '#e1f1f9',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: '600',
    color: '#007CB0',
    marginRight: 8,
    fontSize: 16,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cce5f1',
  },
  picker: {
    height: 40,
    color: '#007CB0',
  },

  card: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007CB0',
    marginBottom: 10,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    fontSize: 16,
    width: 28,
  },
  metaText: {
    fontSize: 15,
    color: '#444',
    flexShrink: 1,
  },
  previewBox: {
    marginTop: 12,
    backgroundColor: '#e1f1f9',
    borderRadius: 8,
    padding: 10,
  },
  previewText: {
    fontSize: 14,
    color: 'black',
    lineHeight: 20,
  },
});
