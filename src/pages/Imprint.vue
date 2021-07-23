<template>
  <QPage
    class="q-pa-md"
  >
    <h2>Partei DIE LINKE</h2>
    <p>
      <b>Bundesgeschäftsstelle</b><br>
      V.i.S.d. Presse- und des Telemediengesetzes: Jörg Schindler<br>
      Kleine Alexanderstraße 28, 10178 Berlin<br>
      Telefon: (030) 24 009 397<br>
      Telefax: (030) 24 009 310<br>
      <a href="mailto:bundesgeschaeftsstelle@die-linke.de" class="text-link">bundesgeschaeftsstelle@die-linke.de</a><br>
    </p>
    <b>technische Entwicklung</b><br>
    <p>
      control.alt.coop eG<br>
      Franz-Mehring-Platz 1<br>
      10243 Berlin<br>
    </p>
    <h2>Finanzamt</h2>
    <p>
      Die Partei DIE LINKE wird beim Finanzamt für Körperschaften I in Berlin unter der
      Steuernummer 27/650/52427 geführt.
    </p>

    <h2>Datenschutz</h2>
    <p>
      Die Partei DIE LINKE nimmt den Schutz Ihrer persönlichen Daten sehr ernst und hält sich strikt an die Regeln
      der Datenschutzgesetze.
      <a
        href="https://www.die-linke.de/seitenfuss/datenschutz/#accordion-heading-17445-2912"
        target="_blank"
        class="text-link"
      >
        weiterlesen
      </a>
    </p>
    <h2>Haftung</h2>
    <p>
      Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
      Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
      <a
        href="https://www.die-linke.de/seitenfuss/impressum/haftungsausschluss/"
        target="_blank"
        class="text-link"
      >
        weiterlesen
      </a>
    </p>
  </QPage>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { QPage } from 'quasar'

export default defineComponent({
  name: 'Imprint',
  components: {
    QPage
  }
})
</script>

<style lang="scss" scoped>
h2 {
  margin: 0.5rem 0;
  font-size: 1.6rem;
}

.scroll-container {
  flex: 1;
  display: flex;
}
</style>
