import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  id_entreprise: string;
}

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      const snap = await getDoc(doc(db, 'article', id));
      if (snap.exists()) setArticle({ id: snap.id, ...snap.data() } as Article);
    };
    fetchOne();
  }, [id]);

  if (!article) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        style={styles.backBtn}
        onPress={() => router.replace('/articles')} // ← destination fixe
      >
        <Text style={styles.backTxt}>⬅︎ Retour</Text>
      </Pressable>

      <Text style={styles.title}>{article.titre}</Text>
      <Text style={styles.meta}>
        🖋️ {article.auteur} &nbsp;&nbsp; • &nbsp;&nbsp; 📅{' '}
        {new Date(article.date_publication_article.seconds * 1000).toLocaleDateString()}
      </Text>

      <Text style={styles.content}>{article.contenu}</Text>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    paddingBottom: 100,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e1f0fb',
    borderRadius: 8,
    shadowColor: '#007CB0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  backTxt: {
    color: '#007CB0',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#004a75',
    textAlign: 'center',
    marginBottom: 12,
  },
  meta: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#333',
    fontWeight: '400',
  },
});
