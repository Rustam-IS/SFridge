<script>
import VTable from "./VTable.vue";

export default {
  components: { VTable },
  props: [
      "rows",
      "cols",
  ]
}
</script>

<template>
  <q-table flat bordered
      style="font-size: 100px"
      :rows="rows"
      :columns="cols"
      row-key="name"
  >

    <template #header="props">
      <q-tr :props="props">
        <q-th auto-width/>
        <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand"
                 :icon="props.expand ? 'remove' : 'add'"/>
        </q-td>
        <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
        >
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <VTable :rows="props.row.data" :cols="props.row.cols"> </VTable>
        </q-td>
      </q-tr>
    </template>

  </q-table>
</template>


<style scoped>
</style>
