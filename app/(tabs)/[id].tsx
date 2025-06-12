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
  onPress={() => router.replace('/articles')}   // ← destination fixe
>
  <Text style={styles.backTxt}>⬅︎ Retour</Text>
</Pressable>


      <Text style={styles.title}>{article.titre}</Text>
      <Text style={styles.meta}>
        🖋️ {article.auteur}   •   📅{' '}
        {new Date(article.date_publication_article.seconds * 1000).toLocaleDateString()}
      </Text>

      <Text style={styles.content}>{article.contenu}</Text>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 60, backgroundColor: '#fff' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  backTxt: { color: '#007CB0', fontSize: 16, fontWeight: '600' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007CB0',
    textAlign: 'center',
    marginBottom: 8,
  },
  meta: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  content: { fontSize: 16, lineHeight: 24, color: '#333' },
});
