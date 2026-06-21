# 🔧 PLANO DE INTEGRAÇÃO — LITERATURA → MVP1

**Timeline**: 4 semanas | **Esforço**: 60h | **Bloqueantes**: 0 | **ROI**: R$90k/ano

---

## 📍 FASE 0: SETUP (DIA 1-2)

### Copia locais
```bash
# De Literatura/ para aquarios/
cp Literatura/demandas_top_1000.json mobile/cache/semantic/demands.json
cp -r Literatura/4_camadas_esotericas/ mobile/cache/semantic/tetragrama/
cp Literatura/SendeirOS_offline_cache.py backend/cache/offline/
cp Literatura/trends_2026.json backend/data/geopolitics/
cp Literatura/escopo_completo_33_eixos_v2.py backend/agro/models/
```

### Cria estrutura de diretórios
```
aquarios-v2-complete/
├── mobile/
│   └── cache/
│       └── semantic/
│           ├── demands.json              [1000 templates]
│           ├── demands.schema.json       [validação]
│           ├── tetragrama/
│           │   ├── layer1_voz_bardo.json
│           │   ├── layer2_quarto_caminho.json
│           │   ├── layer3_7_leis.json
│           │   └── layer4_tarot_cabala.json
│           └── cache_index.json          [hash → resposta]
├── backend/
│   ├── cache/
│   │   ├── offline/
│   │   │   ├── __init__.py
│   │   │   ├── semantic_cache.py         [SQLite ACID]
│   │   │   ├── playbook.py               [funções temáticas]
│   │   │   └── tests/
│   │   └── data/
│   │       └── semantic_cache.db         [gerado 1x]
│   ├── data/
│   │   └── geopolitics/
│   │       ├── trends_2026.json
│   │       └── trends.schema.json
│   └── agro/
│       └── models/
│           ├── cache_manager.py
│           └── fixtures/
│               └── 33_eixos.json
└── docs/
    ├── TETRAGRAMA_IMPLEMENTATION.md
    └── CACHE_USAGE.md
```

---

## 🔄 FASE 1: TETRAGRAMA (SEMANA 1) 

**Responsável**: Backend Lead | **Blocos**: 20h

### 1.1 Implementar Layer 1 (Voz+Bardo)
**Arquivo novo**: `backend/protos/semantic/layer1_voz_bardo.py`

```python
# pseudocódigo
from mobile.cache.semantic.tetragrama.layer1_voz_bardo import BASE_VB

class Layer1VozBardo:
    def diagnosticar_intervalo(self, pergunta: str, emocao: str) -> dict:
        """
        INPUT: "estou ansioso com dinheiro"
        OUTPUT: {
            "modo": "VOZ",  # futuro/treinamento
            "nó_id": "VB-015",
            "traducao": "observe o apego (tanha) por 90s",
            "pratica_90s": "caminhe 1 minuto em silencio",
            "origem": "Voz do Silêncio"
        }
        """
        modo = self._detectar_modo(pergunta)  # VOZ | BARDO
        nos = self._buscar_temas(BASE_VB, pergunta, top=3)
        no_escolhido = self._filtrar_modo(nos, modo)
        return {
            "modo": modo,
            "nó_id": no_escolhido["id"],
            "traducao": no_escolhido["traducao_humana"],
            "pratica_90s": no_escolhido["pratica_90s"],
            "origem": "Voz+Bardo"
        }
```

**Testes** (`backend/tests/test_layer1_voz_bardo.py`):
```python
def test_voz_bardo_ansiedade_financeira():
    resultado = layer1.diagnosticar_intervalo(
        "estou ansioso com dinheiro",
        "ansiedade"
    )
    assert resultado["modo"] == "VOZ"
    assert "tanha" in resultado["traducao"]  # sânscrito
    assert len(resultado["pratica_90s"]) < 100
```

### 1.2 Implementar Layer 2 (Quarto Caminho)
**Arquivo novo**: `backend/protos/semantic/layer2_quarto_caminho.py`

```python
from mobile.cache.semantic.tetragrama.layer2_quarto_caminho import BASE_QC

class Layer2QuartoCaminho:
    def aplicar_3_linhas(self, base_vb: dict, historico_usuario: list) -> dict:
        """
        Transforma resposta Voz/Bardo em 3 ações concretas:
        1. Sobre si (introspectiva)
        2. Com outros (social)
        3. Para trabalho (coletivo)
        """
        linha1 = self._contar_acoes(historico_usuario, "sobre_si")
        linha2 = self._contar_acoes(historico_usuario, "com_outros")
        linha3 = self._contar_acoes(historico_usuario, "para_trabalho")
        
        linha_fraca = min([(linha1, "sobre_si"), (linha2, "com_outros"), (linha3, "para_trabalho")])
        
        acao_5min = self._gerar_acao_concreta(linha_fraca)
        
        return {
            "acao_5min": acao_5min,
            "linhas_balance": {"si": linha1, "outros": linha2, "trabalho": linha3},
            "centro_dominante": self._detectar_centro(base_vb["traducao"])
        }
```

### 1.3 Integrar em ProteOS
**Arquivo modificado**: `mobile/src/modules/ProteOS/index.tsx`

```typescript
// Adicionar ao ProteOS
import { Layer1VozBardo, Layer2QuartoCaminho } from '@/cache/semantic/tetragrama'

export const ProteOSWithTetragrama = () => {
  const [pergunta, setPergunta] = useState('')
  const [resposta, setResposta] = useState(null)
  
  const responder = async (q: string) => {
    // 1. Chamar backend (FastAPI)
    const layer1 = await api.post('/semantic/layer1', { pergunta: q })
    const layer2 = await api.post('/semantic/layer2', { base_vb: layer1, historico })
    
    // 2. Aplicar filtros (vem em Fase 2)
    
    // 3. Humanizar
    const final = humanize(layer2)
    setResposta(final)
  }
  
  return (
    <View>
      <TextInput value={pergunta} onChange={(q) => setPergunta(q)} />
      <Button onPress={() => responder(pergunta)}>
        Pergunte ao ProteOS 🧠
      </Button>
      {resposta && <Text>{resposta.traducao}</Text>}
    </View>
  )
}
```

### 1.4 Verificação
```bash
# No backend
python -m pytest backend/tests/test_layer1_voz_bardo.py -v
python -m pytest backend/tests/test_layer2_quarto_caminho.py -v

# Latência esperada: <100ms (cache hit)
```

**Commit**: `feat: add tetragrama layers 1-2 (voz+bardo, quarto-caminho)`

---

## 🎯 FASE 2: CACHE OFFLINE (SEMANA 2)

**Responsável**: Backend Infra | **Blocos**: 15h

### 2.1 Setup SQLite + Cache Manager
**Arquivo novo**: `backend/cache/offline/semantic_cache.py`

```python
# Copiar de Literatura/ e adaptar
import sqlite3, hashlib, json, pickle
from pathlib import Path
from datetime import datetime, timedelta

class SemanticCache:
    def __init__(self, db_path="data/semantic_cache.db", ttl_days=365):
        Path("data").mkdir(exist_ok=True)
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._criar_tabelas()
        self.ttl = timedelta(days=ttl_days)
    
    def _criar_tabelas(self):
        """Schema: hash_prompt → resposta_cacheada"""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cache_semantico (
                hash_key TEXT PRIMARY KEY,
                layer TEXT,  -- layer1, layer2, layer3, layer4
                categoria TEXT,  -- VOZ, BARDO, QC, LEIS, TAROT
                output_blob BLOB,
                timestamp DATETIME,
                hits INTEGER DEFAULT 0,
                ttl_expires DATETIME
            )
        """)
        self.conn.commit()
    
    def get(self, layer: str, pergunta: str, params: dict = {}):
        hash_key = self._hash(layer, pergunta, params)
        cursor = self.conn.execute(
            "SELECT output_blob, hits FROM cache_semantico WHERE hash_key=? AND ttl_expires > ?",
            (hash_key, datetime.now().isoformat())
        )
        row = cursor.fetchone()
        if row:
            self.conn.execute(
                "UPDATE cache_semantico SET hits=hits+1 WHERE hash_key=?",
                (hash_key,)
            )
            self.conn.commit()
            return pickle.loads(row[0])
        return None
    
    def set(self, layer: str, pergunta: str, params: dict, output: dict):
        hash_key = self._hash(layer, pergunta, params)
        ttl_expires = (datetime.now() + self.ttl).isoformat()
        self.conn.execute(
            "INSERT OR REPLACE INTO cache_semantico VALUES (?,?,?,?,?,0,?)",
            (hash_key, layer, output.get('categoria', 'N/A'), 
             pickle.dumps(output), datetime.now().isoformat(), ttl_expires)
        )
        self.conn.commit()
    
    def _hash(self, layer: str, pergunta: str, params: dict) -> str:
        normalized = f"{layer}:{pergunta.lower().strip()}{json.dumps(params, sort_keys=True)}"
        return hashlib.sha256(normalized.encode()).hexdigest()
    
    def stats(self) -> dict:
        cursor = self.conn.execute("SELECT COUNT(*), SUM(hits) FROM cache_semantico")
        count, hits = cursor.fetchone()
        return {"cached_queries": count or 0, "total_hits": hits or 0}
```

### 2.2 Popular Cache com 1000 demandas
**Script**: `backend/cache/offline/populate_cache.py`

```python
# Roda 1x (production setup)
def populate_semantic_cache():
    """Pré-popula com todas as 1000 variações"""
    cache = SemanticCache()
    
    with open('mobile/cache/semantic/demands.json') as f:
        demandas = json.load(f)['demandas']
    
    for i, item in enumerate(demandas):
        if isinstance(item, dict):
            # Simula o fluxo Tetragrama 4-camadas
            layer1 = diagnosticar_intervalo(item['objetivo'])
            cache.set('layer1', item['objetivo'], item.get('params', {}), layer1)
            
            if i % 100 == 0:
                print(f"Populado: {i}/1000")
    
    print(f"✅ Cache pronto. Stats: {cache.stats()}")
```

### 2.3 Integrar no FastAPI
**Arquivo modificado**: `backend/main.py`

```python
from cache.offline.semantic_cache import SemanticCache

app = FastAPI()
cache = SemanticCache()

@app.post("/semantic/layer1")
async def layer1_with_cache(req: PerguntaRequest):
    # 1. Tenta cache
    cached = cache.get('layer1', req.pergunta, req.params)
    if cached:
        return {"source": "CACHE_HIT", **cached}
    
    # 2. Executa
    resultado = layer1_voz_bardo.diagnosticar_intervalo(req.pergunta, req.emocao)
    
    # 3. Salva cache
    cache.set('layer1', req.pergunta, req.params, resultado)
    
    return {"source": "COMPUTED", **resultado}

@app.get("/cache/stats")
async def cache_stats():
    return cache.stats()
```

### 2.4 Verificação
```bash
# Rodar populate (leva ~2 min primeira vez)
python backend/cache/offline/populate_cache.py

# Testar latência
curl -X POST http://localhost:8000/semantic/layer1 \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"estou ansioso", "emocao":"ansiedade"}'
# Esperado: <50ms com CACHE_HIT

# Verificar stats
curl http://localhost:8000/cache/stats
# Esperado: {"cached_queries": 1000, "total_hits": 0} (antes de usar)
```

**Commit**: `feat: offline-first semantic cache (SQLite, 1000 queries)`

---

## 🌍 FASE 3: GEOPOLITICS (SEMANA 3)

**Responsável**: Frontend + Data | **Blocos**: 15h

### 3.1 Carregar Trends em RLS
**Arquivo novo**: `migrations/72_geopolitics_trends.sql`

```sql
-- Nova tabela pública (sem RLS, é contexto global)
CREATE TABLE existential_geopolitics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tema VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),  -- "IA", "Energia", "Clima", etc
    regiao VARCHAR(50),     -- "Global", "LATAM", "APAC", etc
    fonte VARCHAR(255),
    data_descoberta TIMESTAMP DEFAULT NOW(),
    impacto_score INT DEFAULT 5,  -- 1-10, quão urgente
    comunidades_afetadas TEXT[],  -- ["OdontolarPlus", "heYskY", etc]
    oportunidade BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert 100 trends de Literatura/trends_2026.json
INSERT INTO existential_geopolitics (tema, descricao, categoria, regiao, fonte) 
VALUES 
  ('Anthropic IPO', 'Anthropic perto de US$1 tri', 'Tech', 'Global', 'SeekingAlpha Jun 2026'),
  ('IA Soberana', 'Governos tratam IA como infraestrutura', 'IA', 'Global', 'LinkedIn 2026'),
  ('China nova energia', 'Consumo petróleo cai 4.9% em 2026', 'Energia', 'APAC', 'PetroChina'),
  -- ... 97 mais
ON CONFLICT (tema) DO UPDATE SET updated_at = NOW();

-- Index para busca rápida
CREATE INDEX idx_geopolitics_categoria_regiao ON existential_geopolitics(categoria, regiao);
```

### 3.2 Endpoint de Trends
**Arquivo novo**: `backend/routes/geopolitics.py`

```python
from fastapi import APIRouter, Query
from supabase import create_client

router = APIRouter(prefix="/geopolitics", tags=["Geopolitics"])
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.get("/trends")
async def get_trends(
    categoria: str = Query(None),
    regiao: str = Query(None),
    oportunidade: bool = Query(False)
):
    query = supabase.table("existential_geopolitics").select("*")
    
    if categoria:
        query = query.eq("categoria", categoria)
    if regiao:
        query = query.eq("regiao", regiao)
    if oportunidade:
        query = query.eq("oportunidade", True)
    
    return query.execute().data

@router.get("/trends/nearby-oportunidade")
async def trends_nearby_aquarios():
    """Trends relevantes para os 13 países de Onda 1"""
    ondas = ["Brasil", "Portugal", "USA", "Nigeria", "Peru", "Venezuela"]
    result = supabase.table("existential_geopolitics").select("*").in_("regiao", ondas).execute()
    return result.data
```

### 3.3 Widget em Comunidades
**Arquivo novo**: `mobile/src/modules/Comunidades/GeopoliticsAlert.tsx`

```typescript
export const GeopoliticsAlert = () => {
  const [trends, setTrends] = useState([])
  
  useEffect(() => {
    api.get('/geopolitics/trends?oportunidade=true')
      .then(res => setTrends(res.data))
  }, [])
  
  return (
    <View style={{backgroundColor: '#fff3cd', padding: 12, borderRadius: 8}}>
      <Text style={{fontWeight: 'bold'}}>🌍 Sinal Geopolítico</Text>
      {trends.slice(0, 3).map(t => (
        <Text key={t.id} style={{fontSize: 12, marginTop: 4}}>
          {t.categoria}: {t.tema} ({t.regiao})
        </Text>
      ))}
      <Text style={{fontSize: 10, color: '#666', marginTop: 4}}>
        Algo mudou no mundo. Sua comunidade sente?
      </Text>
    </View>
  )
}
```

### 3.4 Verificação
```bash
# Aplicar migration
supabase migration up

# Verificar dados
curl http://localhost:8000/geopolitics/trends?categoria=IA
# Esperado: 15-20 trends em IA

# Testar oportunidade
curl http://localhost:8000/geopolitics/trends/nearby-oportunidade
# Esperado: trends em BR, PT, US, NG, PE, VE
```

**Commit**: `feat: geopolitics-aware opportunity signals (RLS + widget)`

---

## ✅ FASE 4: VALIDAÇÃO E MERGE (SEMANA 4)

**Responsável**: QA + Tech Lead | **Blocos**: 10h

### 4.1 Teste E2E Tetragrama → Cache → Trends
**Arquivo novo**: `backend/tests/test_e2e_tetragrama_complete.py`

```python
# pytest backend/tests/test_e2e_tetragrama_complete.py -v

class TestTetragramaE2E:
    
    def test_pergunta_ansiedade_fluxo_completo(self):
        """
        USUÁRIO: "estou ansioso com dinheiro"
        ESPERADO: 4 camadas + cache + geopolitics
        """
        pergunta = "estou ansioso com dinheiro"
        
        # Layer 1: Voz+Bardo
        resp_l1 = client.post("/semantic/layer1", json={"pergunta": pergunta})
        assert resp_l1.status_code == 200
        assert "traducao" in resp_l1.json()
        assert "tanha" in resp_l1.json()["traducao"]  # sânscrito
        
        # Cache hit segunda vez
        resp_l1_cached = client.post("/semantic/layer1", json={"pergunta": pergunta})
        assert resp_l1_cached.json()["source"] == "CACHE_HIT"
        
        # Layer 2: Quarto Caminho
        resp_l2 = client.post("/semantic/layer2", json={
            "base_vb": resp_l1.json(),
            "historico": []
        })
        assert "acao_5min" in resp_l2.json()
        
        # Verificar geopolitics é carregado
        geopolitics = client.get("/geopolitics/trends/nearby-oportunidade").json()
        assert len(geopolitics) > 0
    
    def test_latencia_abaixo_50ms(self):
        """Cache deve retornar em <50ms"""
        import time
        start = time.time()
        client.post("/semantic/layer1", json={"pergunta": "teste"})
        latency = (time.time() - start) * 1000
        assert latency < 50, f"Latência {latency}ms > 50ms"
    
    def test_economia_tokens_45_por_cento(self):
        """Se todos os 1000 hits forem no cache, economia = 45% vs sempre chamar Claude"""
        stats = client.get("/cache/stats").json()
        cache_hit_rate = stats["total_hits"] / max(stats["cached_queries"], 1)
        economia_estimada = cache_hit_rate * 0.45 * 22000  # R$22k custo mensal
        print(f"✅ Economia estimada: R${economia_estimada:,.0f}/mês")
        assert cache_hit_rate > 0.7  # esperamos >70% hit rate
```

### 4.2 Relatório de Economias
**Arquivo novo**: `docs/ECONOMY_REPORT_LITERATURA.md`

```markdown
# 📊 Relatório de Economias — Literatura MVP1

## Período: Jun 2026 - Dez 2026 (6 meses)

### API Calls Reduzidas
- **Baseline**: 3000 calls/mês (sem cache)
- **Com cache**: 1000 calls/mês (67% redução)
- **Economia**: 2000 calls/mês × 6 meses = 12,000 calls economizadas

### Tokens Economizados
- **Custo por 1M tokens**: R$3.00 (Sonnet 4.6)
- **Tokens por call média**: 500 tokens
- **12,000 calls × 500 tokens = 6M tokens poupados**
- **R$ economizado**: 6M × (R$3/1M) = **R$18,000 em 6 meses**

### Latência Melhorada
- **Antes**: 1.2s (api call + processamento)
- **Depois**: 0.05s (cache hit) = **24x mais rápido**
- **Impacto UX**: Resposta instantânea = melhor retenção

### ROI
| Investimento | Valor |
|---|---|
| Leitura + extração Literatura | 120h = R$18,000 |
| Implementação Tetragrama | 60h = R$9,000 |
| **Total investimento** | **R$27,000** |

| Retorno | Valor |
|---|---|
| Tokens economizados (6 meses) | R$18,000 |
| Latência (retenção +5%) | ~R$30,000 (estimado) |
| **Total retorno** | **R$48,000** |

**ROI = 78% em 6 meses** ✅

Após 1 ano: ROI = 167% (R$36k economizado)
```

### 4.3 Merge para main
```bash
# 1. Verify all tests pass
pytest backend/tests/test_e2e_tetragrama_complete.py -v

# 2. Coverage > 80%
pytest --cov=backend --cov-report=term-missing

# 3. Build mobile
eas build --platform android --profile preview

# 4. Merge com squash
git checkout main
git pull origin main
git merge --squash feature/literatura-mvp1
git commit -m "feat: tetragrama + cache + geopolitics from literatura

- Layer 1+2 (Voz+Bardo + Quarto Caminho) ✅
- SQLite offline cache (1000 queries, <50ms) ✅
- 100 geopolitics trends (RLS + widget) ✅
- E2E tests + economy report (ROI 78% / 6mo) ✅

Fecha issue #XXX"

git push origin main
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Código
- [ ] Layer 1 (Voz+Bardo) implementado e testado
- [ ] Layer 2 (Quarto Caminho) implementado e testado
- [ ] Layer 3+4 stubs prontos (implementar em MVP2)
- [ ] Cache offline robusto (ACID + TTL)
- [ ] Geopolitics trends carregados (100+ entradas)
- [ ] E2E tests passing (>80% coverage)

### Performance
- [ ] Cache hit rate >70%
- [ ] Latência <50ms (cache hit)
- [ ] Tokens economizados detectados via logging
- [ ] Zero falsos positivos em cache

### Product
- [ ] ProteOS UI com Tetragrama ativo
- [ ] Geopolitics alert visível em Comunidades
- [ ] Trending topics aparecem na home
- [ ] 5 perguntas reais testadas manualmente

### Documentação
- [ ] README.md com arquitetura (Tetragrama 4 camadas)
- [ ] API.md com endpoints `/semantic/*` e `/geopolitics/*`
- [ ] CACHE_USAGE.md para backend devs
- [ ] ECONOMY_REPORT.md para stakeholders

---

## 🚀 PRÓXIMA: MVP2 (SEMANA 5+)

Após merge Fase 1-4:

1. **Layer 3** (7 Leis) — Filtro de absolutismos
2. **Layer 4** (Tarot) — Reframing se 2+ insatisfações
3. **Humanizador** — Tone shift (ansioso → frases curtas)
4. **Validador ético** — Bloquear harm

**Estimativa**: +20h (fácil após base Layer 1-2)

---

## 📞 CONTATO

- **Tech Lead**: Define prioridade de Fase 2-4
- **Backend**: Lidera Fase 1-2
- **Frontend**: Integra em ProteOS (Fase 1.3)
- **QA**: Valida E2E (Fase 4)
- **Product**: Aprova UI geopolitics (Fase 3.3)

---

*Plano detalhado de integração Literatura → MVP1 AquariOS. Pronto para executar.*
