<template>
  <v-dialog @click:outside="$emit('done')" width="500px" v-model="dialog">
    <v-card class="px-2 py-2">
      <v-card-title class="d-flex justify-center">
        New Team
      </v-card-title>
      <v-divider class="mb-3" />
      <v-form
        class="px-8"
        @submit.prevent="submit"
        @keyup.esc.native="$emit('done')"
        @keyup.enter.native="submit"
        ref="form"
      >
        <v-text-field
          label="Team Name"
          :rules="required"
          outlined
          v-model="team_name"
        >
        </v-text-field>
      </v-form>
      <v-card-actions>
        <v-spacer />
        <v-btn text color="primary" v-on:click="submit"> Submit </v-btn>
        <v-btn text v-on:click="$emit('done')"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "NewTeam",
  data() {
    return {
      dialog: true,
      team_name: "",
      required: [(v) => !!v || "This field is required"],
    };
  },
  props: {
    course_id: String,
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) {
        return;
      }
      const team_name = this.team_name;
      const course_id = this.course_id;

      await this.$axios
        .post("/faculty/team/new", {
          team_name,
          course_id,
        })
        .then(() => {
          this.$snack.success("Team added!");
          this.$emit("done");
        })
        .catch((err) => {
          if (err.response.status) {
            this.$snack.error("Team already exists");
          } else {
            this.$snack.error("An error occurred");
          }
        });
    },
  },
};
</script>
