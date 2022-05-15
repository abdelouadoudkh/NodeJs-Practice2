<template>
  <div>
    <h2>Mon Panier</h2>
    <div>
      <div class="panier">
        <article v-for="article in panier.articles" :key="article.id">
          <div class="article-img">
            <div :style="{ backgroundImage: 'url(' + articles[article.id -1].image + ')' }">
            </div>
          </div>
          <div class="article-content">
            <div class="article-title" v-if="editingArticle.id != article.id">
              <h2>{{ articles[article.id -1].name }} - {{ articles[article.id -1].price }}€  - x{{article.quantity}}</h2>
              <button @click='editArticleInCart(article)'>Modifier</button>
              <button @click="removeFromCart(article)">Supprimer</button>
              <div>

              </div>
            </div>
            <div v-else class="article-title">
              <h2>{{ articles[article.id -1].name }} - {{ articles[article.id -1].price }}€  - x<input type="number" v-model="editingArticle.quantity" /> </h2>
              <button @click='editArticleInCart(article)'>Modifier</button>
              <button @click="updateFromPanier(article.id, editingArticle.quantity)">Valider</button>
              <button @click="abortEditArticle()">Annuler</button>
            </div>
            <p >{{ articles[article.id -1].description }}</p>
          </div>
        </article>
        <div class="payer" v-if="panier.articles.length !== 0">
          <br>
          <h3>Informations de payement</h3>
          <label for="payNom">Nom : </label>
          <input type="text" v-model="personne.firstName">
          <label for="payPrenom">Prenom : </label>
          <input type="text" v-model="personne.lastName">
          <button @click="payer()">Payer</button>
        </div>        
      </div>
    </div>
    <!-- TODO -->
  </div>
</template>

<script>
module.exports = {
  props: {
    articles: { type: Array, default: [] },
    panier: { type: Object },
  },
  data () {
    return {
      editingArticle:{
        id: -1,
        quantity: 1
      },
      personne:{
        firstName:'',
        lastName:''
      },
    }
  },
  async mounted () {
  },
  methods: {
    editArticleInCart (article) {
      this.editingArticle.id = article.id
      this.editingArticle.quantity = article.quantity
    },
    abortEditArticle () {
      this.editingArticle = {
        id: -1,
        quantity: -1
      }
    },
    updateFromPanier(id,quantity){
      this.$emit("update-from-panier",{id,quantity})
      this.abortEditArticle()
    },
    removeFromCart(article){
      this.$emit("remove-from-cart", article.id)
    },
    async payer(){
      const res = this.$emit("pay-cart", this.personne)
    }
  }
}
</script>
<style scoped>
article {
  display: flex;
}

.article-img {
  flex: 1;
}

.article-img div {
  width: 100px;
  height: 100px;
  background-size: cover;
}

.article-content {
  flex: 3;
}



textarea {
  width: 100%;
}

.article-title > button{
  float: right;
}
</style>



