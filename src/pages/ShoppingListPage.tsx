import { useEffect, useState, useMemo, useDeferredValue } from 'react'
import { Icon } from '../components/Icon'
import { useI18n } from '../lib/useI18n'
import { getCache, setCache } from '../lib/dataCache'
import {
  fetchInventory,
  fetchSavedRecipes,
  fetchCookingHistory,
  createInventoryItem,
} from '../lib/recipeApi'
import type { AppDestination, Ingredient, Recipe } from '../types/ui'

// 買い物リストの各アイテムの型定義
type ShoppingItem = {
  id: string
  name: string
  category: string
  quantity: number | null // 不足個数
  gram: number | null     // 不足グラム
  isManual: boolean       // 手動で追加されたかどうか
  memo?: string           // メモ（必要とするメニュー名など）
  checked: boolean        // 購入チェック
}

// 食材名からカテゴリを推測するヘルパー
function inferCategory(name: string): string {
  const n = name.toLowerCase()
  if (
    n.includes('肉') || n.includes('豚') || n.includes('牛') || n.includes('鶏') ||
    n.includes('卵') || n.includes('魚') || n.includes('鮭') || n.includes('サケ') ||
    n.includes('ソーセージ') || n.includes('ベーコン') || n.includes('ハム') ||
    n.includes('貝') || n.includes('エビ') || n.includes('カニ')
  ) {
    return '肉・卵・魚'
  }
  if (
    n.includes('キャベツ') || n.includes('レタス') || n.includes('トマト') ||
    n.includes('人参') || n.includes('にんじん') || n.includes('じゃがいも') ||
    n.includes('玉ねぎ') || n.includes('たまねぎ') || n.includes('ナス') ||
    n.includes('ピーマン') || n.includes('大根') || n.includes('だいこん') ||
    n.includes('白菜') || n.includes('はくさい') || n.includes('小松菜') ||
    n.includes('ねぎ') || n.includes('ネギ') || n.includes('きのこ') ||
    n.includes('しいたけ') || n.includes('しめじ') || n.includes('えのき') ||
    n.includes('野菜') || n.includes('ほうれん草')
  ) {
    return '野菜'
  }
  if (
    n.includes('乳') || n.includes('ミルク') || n.includes('チーズ') ||
    n.includes('バター') || n.includes('ヨーグルト') || n.includes('クリーム')
  ) {
    return '乳製品'
  }
  if (
    n.includes('加工') || n.includes('缶') || n.includes('豆腐') ||
    n.includes('納豆') || n.includes('ちくわ') || n.includes('キムチ') ||
    n.includes('パスタ') || n.includes('米') || n.includes('パン') ||
    n.includes('麺') || n.includes('うどん') || n.includes('そば')
  ) {
    return '加工品'
  }
  return 'その他'
}

export function ShoppingListPage({
  onNavigate,
}: {
  onNavigate: (page: AppDestination) => void
  onLogout?: () => void | Promise<void>
}) {
  const { language, t } = useI18n()

  // データの状態管理
  const [fridgeIngredients, setFridgeIngredients] = useState<Ingredient[]>(() => {
    const cached = getCache<Ingredient[]>(`inventory:${language}`)
    return cached || []
  })
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  // ユーザーが選択したメニュー（レシピIDのセット）
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(() => new Set())
  const [isRecipeListOpen, setIsRecipeListOpen] = useState(true) // メニュー選択エリアの開閉

  // 手動で追加した買い物アイテムリスト（LocalStorage等で永続化）
  const [manualItems, setManualItems] = useState<Omit<ShoppingItem, 'checked'>[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('ai-recipe-manual-shopping')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // 新規手動追加用フォームの状態
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemGram, setNewItemGram] = useState('')

  // フィルター・ソート状態（冷蔵庫画面と同様のレイアウト用）
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 選択された買い物リストのアイテムのチェック状態
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(() => new Set())
  const [isSaving, setIsSaving] = useState(false)

  // レシピ一覧と冷蔵庫の在庫を初期ロード
  useEffect(() => {
    let isMounted = true

    Promise.all([
      fetchInventory(language),
      fetchSavedRecipes(language),
      fetchCookingHistory(language),
    ])
      .then(([inventoryRes, savedRes, historyRes]) => {
        if (!isMounted) return

        // 重複を除いたユニークレシピリストを作成
        const uniqueRecipesMap = new Map<string, Recipe>()
        const addRecipe = (r: Recipe) => {
          const key = r.recipeId || r.name
          if (key && !uniqueRecipesMap.has(key)) {
            uniqueRecipesMap.set(key, r)
          }
        }
        savedRes.recipes.forEach(addRecipe)
        historyRes.recipes.forEach(addRecipe)

        setFridgeIngredients(inventoryRes.inventory)
        setCache(`inventory:${language}`, inventoryRes.inventory)
        setRecipes(Array.from(uniqueRecipesMap.values()))
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : t('fridge.fetchFailed'))
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [language, t])

  // 手動アイテムが変更されたら保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ai-recipe-manual-shopping', JSON.stringify(manualItems))
    }
  }, [manualItems])

  // 手動追加の処理
  function handleAddManualItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return

    const category = newItemCategory || inferCategory(newItemName)
    const quantity = newItemQuantity ? Number(newItemQuantity) : null
    const gram = newItemGram ? Number(newItemGram) : null

    const newItem: Omit<ShoppingItem, 'checked'> = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newItemName.trim(),
      category,
      quantity,
      gram,
      isManual: true,
      memo: t('shopping.fridgeMemo'),
    }

    setManualItems((current) => [...current, newItem])
    setNewItemName('')
    setNewItemCategory('')
    setNewItemQuantity('')
    setNewItemGram('')
    setStatusMessage(t('fridge.status.added'))
  }

  // 手動追加アイテムの削除
  function handleDeleteManualItem(id: string) {
    setManualItems((current) => current.filter((item) => item.id !== id))
    setCheckedItemIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  // 自動生成と突き合わせのロジック
  const shoppingItems = useMemo(() => {
    // 1. 選択されたレシピたちから、必要とする材料を集計
    // キー: 食材名 (トリム・小文字化)
    const requiredMap = new Map<
      string,
      {
        name: string
        g: number
        pcs: number
        recipes: Set<string>
      }
    >()

    recipes.forEach((recipe) => {
      const recipeKey = recipe.recipeId || recipe.name
      if (!recipeKey || !selectedRecipeIds.has(recipeKey)) return

      recipe.ingredients?.forEach((ing) => {
        const nameKey = ing.name.trim().toLowerCase()
        const existing = requiredMap.get(nameKey) || {
          name: ing.name,
          g: 0,
          pcs: 0,
          recipes: new Set<string>(),
        }

        existing.recipes.add(recipe.name)

        if (ing.unit === 'g') {
          existing.g += ing.amount
        } else {
          // 'g' 以外は個数として計上
          existing.pcs += ing.amount
        }

        requiredMap.set(nameKey, existing)
      })
    })

    // 2. 冷蔵庫（在庫）の食材を名前ごとに集計
    const inventoryMap = new Map<string, { g: number; pcs: number; category: string }>()
    fridgeIngredients.forEach((ing) => {
      const nameKey = ing.name.trim().toLowerCase()
      const existing = inventoryMap.get(nameKey) || { g: 0, pcs: 0, category: ing.category || 'その他' }
      existing.g += ing.gram || 0
      existing.pcs += ing.quantity || 0
      if (ing.category && ing.category !== 'その他') {
        existing.category = ing.category
      }
      inventoryMap.set(nameKey, existing)
    })

    // 3. 突き合わせを行い不足分を算出
    const autoGenerated: ShoppingItem[] = []
    requiredMap.forEach((req, nameKey) => {
      const inv = inventoryMap.get(nameKey)
      const invG = inv ? inv.g : 0
      const invPcs = inv ? inv.pcs : 0

      const lackG = Math.max(0, req.g - invG)
      const lackPcs = Math.max(0, req.pcs - invPcs)

      if (lackG > 0 || lackPcs > 0) {
        // カテゴリ決定：在庫にあればそのカテゴリ、なければ推測
        const category = inv ? inv.category : inferCategory(req.name)
        const memo = Array.from(req.recipes).join(', ')

        autoGenerated.push({
          id: `auto-${nameKey}`,
          name: req.name,
          category,
          quantity: lackPcs > 0 ? Math.ceil(lackPcs) : null,
          gram: lackG > 0 ? Math.ceil(lackG) : null,
          isManual: false,
          memo: `${t('recipe.ingredientsEyebrow')}: ${memo}`,
          checked: checkedItemIds.has(`auto-${nameKey}`),
        })
      }
    })

    // 4. 手動アイテムとマージ
    const merged: ShoppingItem[] = [
      ...autoGenerated,
      ...manualItems.map((item) => ({
        ...item,
        checked: checkedItemIds.has(item.id),
      })),
    ]

    return merged
  }, [recipes, selectedRecipeIds, fridgeIngredients, manualItems, checkedItemIds, t])

  // カテゴリ一覧（フィルター用）
  const availableCategories = useMemo(() => {
    return Array.from(new Set(shoppingItems.map((item) => item.category)))
  }, [shoppingItems])

  // フィルター適用後の買い物リスト
  const filteredShoppingItems = useMemo(() => {
    const search = deferredSearchQuery.trim().toLowerCase()
    const isCategoryAll = selectedCategories.size === 0

    return shoppingItems.filter((item) => {
      if (!isCategoryAll && !selectedCategories.has(item.category)) {
        return false
      }
      if (search && !item.name.toLowerCase().includes(search) && !item.category.toLowerCase().includes(search)) {
        return false
      }
      return true
    })
  }, [shoppingItems, deferredSearchQuery, selectedCategories])

  // カテゴリごとにグループ化
  const groupedItems = useMemo(() => {
    return filteredShoppingItems.reduce(
      (groups, item) => {
        const cat = item.category || 'その他'
        groups[cat] ??= []
        groups[cat].push(item)
        return groups
      },
      {} as Record<string, ShoppingItem[]>,
    )
  }, [filteredShoppingItems])

  // レシピ選択のトグル処理
  function toggleRecipeSelection(recipeId: string) {
    setSelectedRecipeIds((current) => {
      const next = new Set(current)
      if (next.has(recipeId)) {
        next.delete(recipeId)
      } else {
        next.add(recipeId)
      }
      return next
    })
  }

  // 買い物アイテムのチェックボックス切り替え
  function toggleItemChecked(id: string) {
    setCheckedItemIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // チェックを入れたものを「まとめて冷蔵庫に登録」
  async function handleMoveToFridge() {
    const itemsToMove = shoppingItems.filter((item) => item.checked)
    if (itemsToMove.length === 0) return

    setIsSaving(true)
    setStatusMessage('')

    try {
      // 順次冷蔵庫に登録
      for (const item of itemsToMove) {
        await createInventoryItem({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          gram: item.gram,
          memo: item.memo || t('shopping.fridgeMemo'),
        })
      }

      // 手動アイテムから移動したものを削除
      const manualIdsToRemove = new Set(itemsToMove.filter((item) => item.isManual).map((item) => item.id))
      setManualItems((current) => current.filter((item) => !manualIdsToRemove.has(item.id)))

      // チェック状態と選択状態をリセット
      setCheckedItemIds((current) => {
        const next = new Set(current)
        itemsToMove.forEach((item) => next.delete(item.id))
        return next
      })

      // 在庫データを再ロードして画面を更新
      const result = await fetchInventory(language)
      setFridgeIngredients(result.inventory)
      setCache(`inventory:${language}`, result.inventory)

      setStatusMessage(t('shopping.moveSuccessAlert'))
      setIsSaving(false)
    } catch (err) {
      console.error(err)
      setError(t('receipt.importFailed'))
      setIsSaving(false)
    }
  }

  // カテゴリフィルター切り替え
  function toggleCategoryFilter(category: string) {
    setSelectedCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  function getCategoryLabel(category: string) {
    switch (category) {
      case '肉・卵・魚':
        return t('category.meatEggFish')
      case '野菜':
        return t('category.vegetable')
      case '乳製品':
        return t('category.dairy')
      case '加工品':
        return t('category.processed')
      case 'その他':
        return t('category.other')
      default:
        return category
    }
  }

  // フォームカテゴリー一覧
  const formCategories = ['肉・卵・魚', '野菜', '乳製品', '加工品', 'その他']

  if (loading) {
    return (
      <main className="fridge-container">
        <div className="fridge-header">
          <h1>{t('shopping.title')}</h1>
        </div>
        <div className="fridge-error" style={{ background: '#fff', border: '1px solid var(--line)', padding: '40px' }}>
          <p>{t('shopping.loading')}</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="fridge-container">
        <div className="fridge-header">
          <h1>{t('shopping.title')}</h1>
          <div className="fridge-header-actions">
            <button
              type="button"
              className="secondary-button back-home-button"
              onClick={() => onNavigate('home')}
            >
              <div style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}>
                <Icon name="arrow" />
              </div>
              <span>{t('common.backHome')}</span>
            </button>
          </div>
        </div>
        <div className="fridge-error">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            {t('common.reload')}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="fridge-container">
      {/* ヘッダーセクション */}
      <div className="fridge-header">
        <div>
          <h1>{t('shopping.title')}</h1>
          <p className="ingredient-detail-summary" style={{ margin: '4px 0 0' }}>
            {t('shopping.subtitle')}
          </p>
        </div>
        <div className="fridge-header-actions">
          <button
            type="button"
            className="secondary-button back-home-button"
            onClick={() => onNavigate('home')}
          >
            <div style={{ transform: 'scaleX(-1)', display: 'inline-flex' }}>
              <Icon name="arrow" />
            </div>
            <span>{t('common.backHome')}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="status-message" role="status" style={{ marginBottom: '16px' }}>
          {statusMessage}
        </p>
      )}

      {/* 1. メニュー（レシピ）選択セクション */}
      <section className="category-table-wrapper" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="category-expand-toggle"
          style={{
            marginTop: 0,
            borderRadius: '12px 12px 0 0',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-soft)',
            borderBottom: '1px solid var(--line)',
            color: 'var(--ink)',
            padding: '14px 20px',
            fontSize: '16px',
            fontWeight: '800',
          }}
          onClick={() => setIsRecipeListOpen(!isRecipeListOpen)}
        >
          <span>{t('recipeGenerate.title')} ({selectedRecipeIds.size}件選択中)</span>
          <span style={{ transform: isRecipeListOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▶
          </span>
        </button>
        {isRecipeListOpen && (
          <div style={{ padding: '20px', background: '#fff' }}>
            {recipes.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                {t('history.empty')}
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '12px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {recipes.map((recipe) => {
                  const key = recipe.recipeId || recipe.name
                  if (!key) return null
                  const isSelected = selectedRecipeIds.has(key)
                  return (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--surface-soft)' : '#fff',
                        transition: 'background-color 0.15s',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRecipeSelection(key)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--control-ink)' }}
                      />
                      <span className="ingredient-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {recipe.name}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. 手動追加セクション */}
      <section className="category-table-wrapper" style={{ marginBottom: '24px', padding: '20px', background: '#fff' }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', fontWeight: '800' }}>{t('shopping.addNewTitle')}</h2>
        <form onSubmit={handleAddManualItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{t('fridge.form.name')}</span>
            <input
              type="text"
              required
              className="fridge-search-field"
              style={{
                width: '100%',
                height: '42px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '14px',
              }}
              placeholder={t('shopping.namePlaceholder')}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{t('fridge.form.category')}</span>
            <select
              style={{
                width: '100%',
                height: '42px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '14px',
                background: '#fff',
              }}
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
            >
              <option value="">{t('fridge.form.categorySelect')}</option>
              {formCategories.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{t('fridge.form.quantity')}</span>
            <input
              type="number"
              min="0"
              style={{
                width: '100%',
                height: '42px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '14px',
              }}
              placeholder="例: 1"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{t('fridge.form.gram')}</span>
            <input
              type="number"
              min="0"
              style={{
                width: '100%',
                height: '42px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '14px',
              }}
              placeholder="例: 200"
              value={newItemGram}
              onChange={(e) => setNewItemGram(e.target.value)}
            />
          </div>
          <button type="submit" className="primary-button" style={{ height: '42px', minWidth: '80px' }}>
            {t('shopping.addBtn')}
          </button>
        </form>
      </section>

      {/* 3. フィルター & 一括操作バー */}
      <div className="fridge-filter-panel" style={{ marginBottom: '20px' }}>
        <div className="fridge-filter-bar">
          <div className="fridge-search-field">
            <span>{t('fridge.filter.search')}</span>
            <input
              type="text"
              placeholder={t('shopping.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`secondary-button fridge-filter-toggle ${isFilterOpen ? 'is-active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{t('fridge.filter.open')}</span>
            <span>⚙</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className="fridge-filter-options" style={{ padding: '12px 0 0 0' }}>
            <div className="fridge-filter-group">
              <legend style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                {t('fridge.filter.category')}
              </legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableCategories.map((c) => {
                  const isActive = selectedCategories.has(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`filter-pill ${isActive ? 'active' : ''}`}
                      onClick={() => toggleCategoryFilter(c)}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      {getCategoryLabel(c)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 一括冷蔵庫登録アクションバー */}
      {shoppingItems.some((item) => item.checked) && (
        <div
          className="fridge-bulk-actions"
          style={{
            background: 'var(--surface-soft)',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ margin: 0, fontWeight: '700' }}>
            {t('shopping.selectedItemsText', { count: shoppingItems.filter((item) => item.checked).length })}
          </span>
          <button
            type="button"
            className="primary-button"
            disabled={isSaving}
            onClick={handleMoveToFridge}
            style={{ padding: '0 16px', height: '38px', fontSize: '13px' }}
          >
            {isSaving ? t('common.saving') : t('shopping.moveToFridgeBtn')}
          </button>
        </div>
      )}

      {/* 4. 買い物リストテーブル表示 */}
      {shoppingItems.length === 0 ? (
        <div className="fridge-error" style={{ background: '#fff', border: '1px solid var(--line)', padding: '40px' }}>
          <p>{t('shopping.empty')}</p>
        </div>
      ) : (
        <div className="fridge-tables">
          {Object.keys(groupedItems).map((category) => {
            const items = groupedItems[category]
            if (!items || items.length === 0) return null

            return (
              <div key={category} className="category-table-wrapper">
                <h3 className="category-title">{getCategoryLabel(category)}</h3>
                <div className="table-container">
                  <table className="fridge-table">
                    <thead>
                      <tr>
                        <th style={{ width: '48px', textAlign: 'center' }}>
                          {/* 選択列 */}
                        </th>
                        <th>{t('fridge.table.ingredient')}</th>
                        <th>{t('fridge.form.quantity')}</th>
                        <th>{t('fridge.form.gram')}</th>
                        <th>{t('fridge.table.memo')}</th>
                        <th style={{ width: '100px' }}>{t('fridge.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className={item.checked ? 'near-expiration-row' : ''}>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '16px 20px' }}>
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleItemChecked(item.id)}
                            />
                          </td>
                          <td className="ingredient-name-cell" style={{ verticalAlign: 'middle' }}>
                            <span className="ingredient-name" style={{ fontWeight: '800' }}>{item.name}</span>
                            {item.isManual && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  fontSize: '10px',
                                  background: 'var(--line)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {t('receipt.candidatesEyebrow')}
                              </span>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            {item.quantity ? `${item.quantity}個` : '-'}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            {item.gram ? `${item.gram}g` : '-'}
                          </td>
                          <td style={{ color: 'var(--muted)', fontSize: '13px', verticalAlign: 'middle' }}>
                            {item.memo || '-'}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            {item.isManual ? (
                              <button
                                type="button"
                                className="secondary-button"
                                style={{
                                  borderColor: 'var(--danger)',
                                  color: 'var(--danger)',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  minHeight: 'auto',
                                }}
                                onClick={() => handleDeleteManualItem(item.id)}
                              >
                                {t('common.delete')}
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>
                                {t('recipe.inStock')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
