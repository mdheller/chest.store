<template>
  <base-nav
    containerClasses="px-4 container-fluid"
    class="navbar-top navbar-dark"
    id="navbar-main"
    :show-toggle-button="true"
    expand
  >
    <!-- <form
      class="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto"
    >
      <div class="form-group mb-0">
                <base-input placeholder="Search"
                            class="input-group-alternative"
                            alternative=""
                            addon-right-icon="fas fa-search">
                </base-input>
            </div>
    </form> -->
    <ul class="navbar-nav align-items-center ml-auto d-block d-md-flex">
      <li class="nav-item dropdown w-100">
        <base-dropdown class="nav-link w-100 pr-0" position="right">
          <div class="media align-items-center" slot="title">
            <span class="avatar avatar-sm rounded-circle bg-yellow">
              <!-- <img alt="Image placeholder" src="img/theme/team-4-800x800.jpg"> -->
              <div class="text-uppercase text-primary">
                <strong>{{ userName[0] }}</strong>
              </div>
            </span>
            <div class="media-body ml-2 d-block">
              <span class="mb-0 text-sm  font-weight-bold">{{ userName }}</span>
            </div>
          </div>

          <template>
            <div class=" dropdown-header noti-title">
              <h6 class="text-overflow m-0">Welcome!</h6>
            </div>
            <!-- <router-link to="/profile" class="dropdown-item">
                            <i class="ni ni-single-02"></i>
                            <span>My profile</span>
                        </router-link>-->
            <router-link to="/profile" class="dropdown-item">
              <i class="ni ni-settings-gear-65"></i>
              <span>Settings</span>
            </router-link>
            <!-- <router-link to="/profile" class="dropdown-item">
                            <i class="ni ni-calendar-grid-58"></i>
                            <span>Activity</span>
                        </router-link>
                        <router-link to="/profile" class="dropdown-item">
                            <i class="ni ni-support-16"></i>
                            <span>Support</span>
                        </router-link>
                        <div class="dropdown-divider"></div> -->
            <a href="/logout" class="dropdown-item">
              <i class="ni ni-user-run"></i>
              <span>Logout</span>
            </a>
          </template>
        </base-dropdown>
      </li>
    </ul>
  </base-nav>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    data() {
      return {
        activeNotifications: false,
        showMenu: false,
        searchQuery: '',
      }
    },

    computed: mapState({
      userName: (state) =>
        (state.session.user && state.session.user.username) || '',
    }),

    methods: {
      toggleSidebar() {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar)
      },
      hideSidebar() {
        this.$sidebar.displaySidebar(false)
      },
      toggleMenu() {
        this.showMenu = !this.showMenu
      },
    },
  }
</script>
