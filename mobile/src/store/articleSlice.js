import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as articleService from '../services/article';

export const loadArticles = createAsyncThunk(
  'articles/loadAll',
  async (_, { rejectWithValue }) => {
    try { return await articleService.fetchArticles(); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const loadArticleById = createAsyncThunk(
  'articles/loadOne',
  async (id, { rejectWithValue }) => {
    try { return await articleService.fetchArticleById(id); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const loadAdminArticles = createAsyncThunk(
  'articles/loadAdmin',
  async (accessToken, { rejectWithValue }) => {
    try { return await articleService.fetchAllArticlesAdmin(accessToken); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

// payload: { articleData, featuredImageFile, accessToken }
export const addArticle = createAsyncThunk(
  'articles/add',
  async ({ articleData, featuredImageFile, accessToken }, { rejectWithValue }) => {
    try { return await articleService.createArticleApi(articleData, featuredImageFile, accessToken); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const editArticle = createAsyncThunk(
  'articles/edit',
  async ({ id, articleData, featuredImageFile, accessToken }, { rejectWithValue }) => {
    try { return await articleService.updateArticleApi(id, articleData, featuredImageFile, accessToken); }
    catch (e) { return rejectWithValue(e.message); }
  }
);

export const removeArticle = createAsyncThunk(
  'articles/remove',
  async ({ id, accessToken }, { rejectWithValue }) => {
    try { await articleService.deleteArticleApi(id, accessToken); return id; }
    catch (e) { return rejectWithValue(e.message); }
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState: { list: [], adminList: [], selected: null, loading: false, error: null },
  reducers: { clearArticleError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    const p = (s) => { s.loading = true;  s.error = null; };
    const r = (s, a) => { s.loading = false; s.error = a.payload; };

    builder.addCase(loadArticles.pending, p).addCase(loadArticles.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; }).addCase(loadArticles.rejected, r);
    builder.addCase(loadArticleById.pending, p).addCase(loadArticleById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; }).addCase(loadArticleById.rejected, r);
    builder.addCase(loadAdminArticles.pending, p).addCase(loadAdminArticles.fulfilled, (s, a) => { s.loading = false; s.adminList = a.payload; }).addCase(loadAdminArticles.rejected, r);
    builder.addCase(addArticle.pending, p).addCase(addArticle.fulfilled, (s, a) => { s.loading = false; s.adminList.unshift(a.payload); }).addCase(addArticle.rejected, r);
    builder.addCase(editArticle.pending, p).addCase(editArticle.fulfilled, (s, a) => { s.loading = false; const idx = s.adminList.findIndex((x) => x._id === a.payload._id); if (idx !== -1) s.adminList[idx] = a.payload; }).addCase(editArticle.rejected, r);
    builder.addCase(removeArticle.pending, p).addCase(removeArticle.fulfilled, (s, a) => { s.loading = false; s.adminList = s.adminList.filter((x) => x._id !== a.payload); }).addCase(removeArticle.rejected, r);
  },
});

export const { clearArticleError } = articleSlice.actions;
export default articleSlice.reducer;