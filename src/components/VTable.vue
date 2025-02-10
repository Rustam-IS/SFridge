<script>
export default {
  props: ["rows", "cols", "upd", "del"],
}
</script>

<template>
  <q-table :rows="rows"  :columns="cols" row-key="uuid" :upd="upd">

    <template #header="props">
      <q-tr :props="props">
        <q-th auto-width/>
        <q-th v-for="col in props.cols"
            :key="col.name"  :props="props"
            style="font-size: 1em"
        >
          <strong> {{ col.label }} </strong>
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
            style="font-size: 1em"
            v-html="col.value"
        > </q-td>
        <q-td auto-width v-if="del">
          <q-btn size="sm" color="accent" dense @click="del(props.key)"
                 :icon="'delete'"/>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%" style="font-size: 1em">
          <slot name="about" :key="props.key" :row="props.row"> </slot>
        </q-td>
      </q-tr>
    </template>

  </q-table>
</template>
