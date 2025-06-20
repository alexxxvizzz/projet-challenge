/* app/(tabs)/articlesAdmin.tsx */

import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../utils/firebase';

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

const notify = (title: string, msg: string) =>
  Platform.OS === 'web'
    ? window.alert(`${title}\n\n${msg}`)
    : Alert.alert(title, msg);

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const [fTitre, setFTitre] = useState('');
  const [fAuteur, setFAuteur] = useState('');
  const [fContenu, setFContenu] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fCat, setFCat] = useState('');
  const [fDate, setFDate] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'article')).then((snap) =>
      setArticles(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Article[])
    );
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.categorie))).filter(Boolean),
    [articles]
  );

  const resetForm = () => {
    setFTitre('');
    setFAuteur('');
    setFContenu('');
    setFUrl('');
    setFCat('');
    setFDate('');
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
    setSelected(null);
    setModalVisible(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setFTitre(selected.titre);
    setFAuteur(selected.auteur);
    setFContenu(selected.contenu);
    setFUrl(selected.url);
    setFCat(selected.categorie);
    setFDate(new Date(selected.date_publication_article.seconds * 1000).toISOString().slice(0, 10));
    setIsEditing(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setIsCreating(false);
    setSelected(null);
    resetForm();
  };

  const createArticle = async () => {
    if (!fTitre || !fAuteur || !fContenu || !fCat || !fDate) {
      notify('Champs requis', 'Titre, auteur, contenu, catégorie et date sont obligatoires.');
      return;
    }
    const ref = await addDoc(collection(db, 'article'), {
      titre: fTitre,
      auteur: fAuteur,
      contenu: fContenu,
      url: fUrl,
      categorie: fCat,
      date_publication_article: new Date(fDate),
      id_entreprise: 'junior_entreprise',
    });
    setArticles((p) => [
      ...p,
      {
        id: ref.id,
        titre: fTitre,
        auteur: fAuteur,
        contenu: fContenu,
        url: fUrl,
        categorie: fCat,
        date_publication_article: new Date(fDate),
        id_entreprise: 'junior_entreprise',
      },
    ]);
    notify('Créé', 'Article ajouté.');
    closeModal();
  };

  const saveEdit = async () => {
    if (!selected) return;
    await updateDoc(doc(db, 'article', selected.id), {
      titre: fTitre,
      auteur: fAuteur,
      contenu: fContenu,
      url: fUrl,
      categorie: fCat,
      date_publication_article: new Date(fDate),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? {
              ...a,
              titre: fTitre,
              auteur: fAuteur,
              contenu: fContenu,
              url: fUrl,
              categorie: fCat,
              date_publication_article: new Date(fDate),
            }
          : a
      )
    );
    notify('Mis à jour', 'Article modifié.');
    closeModal();
  };

  const deleteArticle = async () => {
    if (!selected) return;
    const ok =
      Platform.OS === 'web'
        ? window.confirm('Supprimer cet article ?')
        : await new Promise<boolean>((res) =>
            Alert.alert('Confirmation', 'Supprimer cet article ?', [
              { text: 'Annuler', style: 'cancel', onPress: () => res(false) },
              { text: 'Supprimer', style: 'destructive', onPress: () => res(true) },
            ])
          );
    if (!ok) return;
    await deleteDoc(doc(db, 'article', selected.id));
    setArticles((prev) => prev.filter((a) => a.id !== selected.id));
    notify('Supprimé', 'Article effacé.');
    closeModal();
  };

  const visibleArticles =
    selectedCat === 'ALL' ? articles : articles.filter((a) => a.categorie === selectedCat);

  const renderItem = ({ item }: { item: Article }) => (
    <TouchableOpacity onPress={() => (setSelected(item), setModalVisible(true))}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.titre}</Text>
        <View style={styles.row}><Text style={styles.icon}>🖋️</Text><Text style={styles.value}>{item.auteur}</Text></View>
        <View style={styles.row}><Text style={styles.icon}>📅</Text><Text style={styles.value}>{new Date(item.date_publication_article.seconds * 1000).toLocaleDateString()}</Text></View>
        <View style={styles.row}><Text style={styles.icon}>🏷️</Text><Text style={styles.value}>{item.categorie}</Text></View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestion des articles</Text>
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
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.8}>
        <Text style={styles.fabTxt}>＋</Text>
      </TouchableOpacity>
      <FlatList
        data={visibleArticles}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 90 }}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.modalBox} keyboardShouldPersistTaps="handled">
            {selected && !isEditing && !isCreating && (
              <>
                <Text style={styles.modalTitle}>{selected.titre}</Text>
                <Text style={styles.modalText}>🖋️ {selected.auteur}</Text>
                <Text style={styles.modalText}>📅 {new Date(selected.date_publication_article.seconds * 1000).toLocaleDateString()}</Text>
                <Text style={styles.modalText}>🏷️ {selected.categorie}</Text>
                <Text style={styles.modalText}>{selected.contenu}</Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.closeBtn} onPress={closeModal}><Text style={styles.btnTxt}>Fermer</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} onPress={openEdit}><Text style={styles.btnTxt}>Modifier</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={deleteArticle}><Text style={styles.btnTxt}>Supprimer</Text></TouchableOpacity>
                </View>
              </>
            )}
            {(isCreating || isEditing) && (
              <>
                <Text style={styles.modalTitle}>{isCreating ? 'Nouvel article' : 'Modifier l’article'}</Text>
                <Text style={styles.labelField}>Titre*</Text>
                <TextInput style={styles.input} value={fTitre} onChangeText={setFTitre} />
                <Text style={styles.labelField}>Auteur*</Text>
                <TextInput style={styles.input} value={fAuteur} onChangeText={setFAuteur} />
                <Text style={styles.labelField}>Catégorie*</Text>
                <TextInput style={styles.input} value={fCat} onChangeText={setFCat} />
                <Text style={styles.labelField}>URL</Text>
                <TextInput style={styles.input} value={fUrl} onChangeText={setFUrl} />
                <Text style={styles.labelField}>Contenu*</Text>
                <TextInput style={[styles.input, { height: 100 }]} multiline value={fContenu} onChangeText={setFContenu} />
                <Text style={styles.labelField}>Date de publication* (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={fDate} onChangeText={setFDate} />
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.closeBtn} onPress={closeModal}><Text style={styles.btnTxt}>Annuler</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} onPress={isCreating ? createArticle : saveEdit}>
                    <Text style={styles.btnTxt}>{isCreating ? 'Créer' : 'Enregistrer'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 20 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#007CB0' },
  filterBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filterLabel: { fontWeight: '600', marginRight: 8, color: '#007CB0' },
  picker: { flex: 1, height: 40 },
  fab: { position: 'absolute', top: 18, left: 15, backgroundColor: '#007CB0', width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  fabTxt: { color: '#fff', fontSize: 28, fontWeight: '700' },
  card: { backgroundColor: '#f9f9f9', borderLeftWidth: 6, borderLeftColor: '#007CB0', borderRadius: 12, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#007CB0', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { fontSize: 16, width: 28 },
  value: { fontSize: 15, color: '#333' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#007CB0', textAlign: 'center', marginBottom: 12 },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  btnRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 },
  closeBtn: { backgroundColor: '#aaa', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  editBtn: { backgroundColor: '#27A844', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  delBtn: { backgroundColor: '#E10700', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  labelField: { marginTop: 8, fontWeight: '600', color: '#007CB0' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4 },
});
