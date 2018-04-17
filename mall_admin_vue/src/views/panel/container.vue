<template>
    <div class="cs-layout-container" :class="{'layout-hide-text': spanLeft < 4}">
        <Row class="cs-layout-wrap" type="flex">
            <Col :span="spanLeft" class="cs-layout-left">
                <Menu active-name="1-2" theme="dark" width="auto" :open-names="['1']">
                    <div class="cs-layout-logo-left"></div>
                    <Submenu name="1">
                        <template slot="title">
                            <Icon type="ios-navigate"></Icon>
                            Item 1
                        </template>
                        <MenuItem name="1-1">Option 1</MenuItem>
                        <MenuItem name="1-2">Option 2</MenuItem>
                        <MenuItem name="1-3">Option 3</MenuItem>
                    </Submenu>
                    <Submenu name="2">
                        <template slot="title">
                            <Icon type="ios-keypad"></Icon>
                            Item 2
                        </template>
                        <MenuItem name="2-1">Option 1</MenuItem>
                        <MenuItem name="2-2">Option 2</MenuItem>
                    </Submenu>
                    <Submenu name="3">
                        <template slot="title">
                            <Icon type="ios-analytics"></Icon>
                            Item 3
                        </template>
                        <MenuItem name="3-1">Option 1</MenuItem>
                        <MenuItem name="3-2">Option 2</MenuItem>
                    </Submenu>
                    <Submenu name="4">
                        <template slot="title">
                            <Icon type="ios-analytics"></Icon>
                            Item 3
                        </template>
                        <MenuItem name="4-1">Option 1</MenuItem>
                        <MenuItem name="4-2">Option 2</MenuItem>
                    </Submenu>
                    <Submenu name="5">
                        <template slot="title">
                            <Icon type="ios-analytics"></Icon>
                            Item 3
                        </template>
                        <MenuItem name="5-1">Option 1</MenuItem>
                        <MenuItem name="5-2">Option 2</MenuItem>
                    </Submenu>
                </Menu>
            </Col>
            <Col :span="spanRight">
                <div class="cs-layout-header">
                    <Button type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="cs-layout-breadcrumb">
                    <Breadcrumb>
                        <BreadcrumbItem href="#">Index</BreadcrumbItem>
                        <BreadcrumbItem href="#">Apps</BreadcrumbItem>
                        <BreadcrumbItem>App</BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <div class="cs-layout-content" v-bind:class="contentClass">
                    <div class="cs-layout-content-main">
                        <router-view></router-view>
                    </div>
                </div>
                <div class="cs-layout-copy">
                    2011-2016 &copy; TalkingData
                </div>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        name:'ch_panel_container',
        data () {
            return {
                spanLeft: 4,
                spanRight: 20,
                contentClass:'cs-layout-content-default'
            }
        },
        mounted() {
            let contentstr='cs-layout-content-',
                contentlist=['default','dot','filter','whitecross','bigblock'],
            len=contentlist.length,
            index=Math.floor(Math.random() * len);
            console.log(index);
            this.contentClass=`${contentstr}${contentlist[index]}`;
        },
        computed: {
            iconSize () {
                return this.spanLeft === 4 ? 14 : 24;
            }
        },
        methods: {
            toggleClick () {
                if (this.spanLeft === 4) {
                    this.spanLeft = 2;
                    this.spanRight = 22;
                } else {
                    this.spanLeft = 4;
                    this.spanRight = 20;
                }
            }
        }
    };
</script>
