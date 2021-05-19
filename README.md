# Storinka Cafe Vuex

A store for Storinka theme with Vuex.

## Installation

```shell
yarn add @storinka/cafe-vuex
```

## Usage

```javascript
// store/index.js

import StorinkaClient from "@storinka/client";
import { createStoreModule } from "@storinka/cafe-vuex";

const client = new StorinkaClient({
    clientId: "your-client-id",
});

export default createStore({
    modules: {
        cafe: createStoreModule({
            client,
            namespaced: true,
        }),
    }
});
```

```vue
<!-- App.vue -->

<template>
    <div v-if="cafe">
        <h1>
            {{ cafe.name }}
        </h1>
        <p>
            {{ cafe.description }}
        </p>
    </div>
</template>

<script>
export default {
    computed: {
        cafe() {
            return this.$store.getters["cafe/cafe"];
        },
    },
    mounted() {
        this.setCafe("kava-gallery", "uk");
    },
    methods: {
        setCafe(id, locale = "en") {
            this.$store.dispatch("cafe/setCafe", { id, locale })
        },
    },
}
</script>
```
