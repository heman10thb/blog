import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
const TUTORIALS_COLLECTION = 'tutorials';
const CATEGORIES_COLLECTION = 'categories';
const TAGS_COLLECTION = 'tags';

// ============ TUTORIALS ============

export async function getAllTutorials() {
    const q = query(
        collection(db, TUTORIALS_COLLECTION),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getTutorialBySlug(slug) {
    const q = query(
        collection(db, TUTORIALS_COLLECTION),
        where('slug', '==', slug),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

export async function getTutorialsByCategory(categorySlug) {
    const q = query(
        collection(db, TUTORIALS_COLLECTION),
        where('categorySlug', '==', categorySlug),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getFeaturedTutorials() {
    const q = query(
        collection(db, TUTORIALS_COLLECTION),
        where('featured', '==', true),
        where('status', '==', 'published'),
        limit(6)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRecentTutorials(count = 5) {
    const q = query(
        collection(db, TUTORIALS_COLLECTION),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createTutorial(tutorialData) {
    const data = {
        ...tutorialData,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: tutorialData.status === 'published' ? serverTimestamp() : null
    };
    const docRef = await addDoc(collection(db, TUTORIALS_COLLECTION), data);
    return docRef.id;
}

export async function updateTutorial(id, tutorialData) {
    const docRef = doc(db, TUTORIALS_COLLECTION, id);
    await updateDoc(docRef, {
        ...tutorialData,
        updatedAt: serverTimestamp()
    });
}

export async function deleteTutorial(id) {
    const docRef = doc(db, TUTORIALS_COLLECTION, id);
    await deleteDoc(docRef);
}

export async function incrementViews(id) {
    const docRef = doc(db, TUTORIALS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        const currentViews = snapshot.data().views || 0;
        await updateDoc(docRef, { views: currentViews + 1 });
    }
}

// ============ CATEGORIES ============

export async function getAllCategories() {
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getCategoryBySlug(slug) {
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where('slug', '==', slug),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

export async function createCategory(categoryData) {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...categoryData,
        tutorialCount: 0
    });
    return docRef.id;
}

export async function updateCategory(id, categoryData) {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, categoryData);
}

export async function deleteCategory(id) {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
}

// ============ ADMIN STATS ============

export async function getAdminStats() {
    const [tutorials, categories] = await Promise.all([
        getDocs(collection(db, TUTORIALS_COLLECTION)),
        getDocs(collection(db, CATEGORIES_COLLECTION))
    ]);

    let totalViews = 0;
    let publishedCount = 0;
    let draftCount = 0;

    tutorials.docs.forEach(doc => {
        const data = doc.data();
        totalViews += data.views || 0;
        if (data.status === 'published') publishedCount++;
        else draftCount++;
    });

    return {
        totalTutorials: tutorials.size,
        publishedTutorials: publishedCount,
        draftTutorials: draftCount,
        totalCategories: categories.size,
        totalViews
    };
}
