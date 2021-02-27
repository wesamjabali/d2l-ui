<template>
  <div>
    <NewContent
      :course_id="course_id"
      v-if="new_content_dialog"
      @done="new_content_dialog = false"
    />
    <NewTeam
      :course_id="course_id"
      v-if="new_team_dialog"
      @done="new_team_dialog = false"
    />
    <AddTeam
      :course_id="course_id"
      v-if="add_team_member_dialog"
      @done="add_team_member_dialog = false"
    />
    <v-card
      :class="['mx-auto', 'pb-5']"
      :width="mobile_user ? '100vw' : '90vw'"
      elevation="0"
    >
      <div class="text-center title py-2">
        <div>
          {{ course.title }}
        </div>
        <div class="subtitle-1">
          {{ course.course_prefix }}-{{ course.course_number }}-{{
            course.section_number
          }}
        </div>
      </div>
      <v-btn v-if="authorized_user" @click="new_content_dialog = true"
        >New Content</v-btn
      >
      <!-- Team Management for faculty -->
      <v-menu v-if="authorized_user" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on">
            Manage teams
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="item in manage_team"
            :key="item.name"
            @click="item.action"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-row>
        <v-col cols="12" md="4">
          <v-card class="pb-5" outlined>
            <div class="primary white--text mb-5 py-2">
              <div class="title text-center">Content</div>
              <div class="subtitle-2 text-center">Click to Download</div>
            </div>

            <v-card
              :class="[!mobile_user ? 'mx-5' : 'mx-3', 'mb-5']"
              outlined
              hover
              v-for="item in content"
              :key="item.id"
              @click="getFile(item.id)"
            >
              <div class="title secondary white--text text-center py-2">
                {{ item.title }}
              </div>

              <div class="subtitle-2 mx-5 mt-2">{{ item.body }}</div>
              <v-card-actions class="justify-end mb-n2">
                <v-switch disabled v-model="item.is_graded" label="Graded">
                </v-switch>
              </v-card-actions>
            </v-card>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pb-5" outlined>
            <div class="primary white--text mb-5 py-2">
              <div class="title text-center">{{ team_name }}</div>
              <div class="subtitle-2 text-center">Members</div>
            </div>
            <v-card
              class="mx-5 mb-5"
              outlined
              hover
              v-for="person in team"
              :key="person.id"
            >
              <div class="title secondary white--text text-center py-2">
                {{ person.first_name + " " + person.last_name }}
              </div>
              <div class="subtitle-2 mx-5 mt-2 pb-5">
                <b>Phone: </b>
                {{ person.phone }}
                <br />
                <b>Email: </b>

                {{ person.email }}
              </div>
            </v-card>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pb-5" outlined>
            <div class="primary white--text mb-5 py-2">
              <div class="title text-center">Discussions</div>
              <div class="subtitle-2 text-center">Not implemented yet.</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import NewContent from "@/components/Faculty/NewContent";
import NewTeam from "@/components/Faculty/NewTeam";
import AddTeam from "@/components/Faculty/AddTeam";
export default {
  name: "Course",
  components: {
    NewContent,
    NewTeam,
    AddTeam,
  },
  props: {
    course_id: String,
  },
  data() {
    return {
      mobile_user: !this.$vuetify.smAndUp,
      new_team_dialog: false,
      add_team_member_dialog: false,
      authorized_user:
        this.$store.getters.roles.includes("faculty") ||
        this.$store.getters.roles.includes("admin"),
      manage_team: [
        {
          name: "Create New Team",
          action: () => {
            this.new_team_dialog = true;
          },
        },
        {
          name: "Add Team Member",
          action: () => {
            this.add_team_member_dialog = true;
          },
        },
      ],
      new_content_dialog: false,
      course: [],
      content: [],
      team: [],
      discussions: [],
      team_name: "",
    };
  },
  mounted() {
    this.get_course_info();
    this.get_content_info();
    this.get_team();
  },
  methods: {
    async get_course_info() {
      await this.$axios
        .get("/user/course/get", {
          params: { course_id: this.course_id },
        })
        .then((res) => {
          this.course = res.data.course;
        });
    },
    async get_content_info() {
      await this.$axios
        .get("/user/content/getAllForCourse", {
          params: { course_id: this.course_id },
        })
        .then((res) => {
          this.content = res.data.content;
        });
    },
    async get_team() {
      await this.$axios
        .get("/user/team/getOwnForCourse", {
          params: { course_id: this.course_id },
        })
        .then((res) => {
          if (!res.data.team) {
            this.team_name = "You're not in a team!";
            return;
          }
          this.team_name = res.data.team.team_name;
          this.get_team_members(res.data.team.id);
        });
    },
    async get_team_members(team_id) {
      await this.$axios
        .get("/user/team/getUsers", {
          params: { team_id: team_id },
        })
        .then((res) => {
          this.team = res.data.team;
        });
    },
    async getFile(content_id) {
      await this.$axios
        .get("/user/content/getFile", {
          params: { content_id: content_id },
          responseType: "blob",
        })
        .then((res) => {
          const fileName = res.headers["content-disposition"].split('"')[1];
          const fileURL = window.URL.createObjectURL(
            new Blob([res.data], { type: res.headers["content-type"] })
          );
          const fileLink = document.createElement("a");
          fileLink.href = fileURL;
          fileLink.setAttribute("download", fileName);
          document.body.appendChild(fileLink);
          fileLink.click();
          this.$snack.success("Downloading content!");
        })
        .catch((err) => {
          if (err.response.status == 404) {
            this.$snack.error(
              `That file doesn't exist.<br />
              Heroku may have deleted it!`
            );
          } else {
            this.$snack.error("An error occurred");
          }
        });
    },
  },
};
</script>