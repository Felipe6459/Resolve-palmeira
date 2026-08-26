/* GestorPro — compatibilidade de persistência
   A persistência oficial agora é controlada por gestorpro-persistence-v14.js.
   Este arquivo permanece para não quebrar páginas que ainda o carreguem, mas
   NÃO intercepta saveClient/saveServer e NÃO cria uma segunda sincronização.
*/
(function(){
  window.GestorProDirectDB = {
    save: async function(){
      if(window.GestorProPersistence?.save) return window.GestorProPersistence.save();
      throw new Error('Persistência do GestorPro ainda não foi carregada.');
    }
  };
})();
