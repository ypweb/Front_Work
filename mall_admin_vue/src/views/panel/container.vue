<template>
    <div class="cs-layout-container" :class="{'layout-hide-text': spanLeft < 4}">
        <Row class="cs-layout-wrap" type="flex">
            <Col :span="spanLeft" class="cs-layout-left">
            <Menu active-name="1-2" theme="dark" width="auto" :open-names="['1']">
                <div class="cs-layout-logo-left">
                </div>
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
            <Col class="cs-layout-mainbox" v-bind:class="mainboxTheme"  :span="spanRight">
            <div class="cs-layout-header">
                <div class="cs-header-navicon">
                    <Button type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="cs-header-info">
                    <div class="cs-header-wrap cs-header-list">

                    </div>
                    <div class="cs-header-wrap cs-header-setting">
                        <Dropdown trigger="click">
                            <a href="javascript:void(0)">
                                <Icon color="#999" type="ios-gear" size="18"></Icon>
                            </a>
                            <DropdownMenu slot="list">
                                    <DropdownItem v-on:click="changeMainBoxTheme(index)"  v-for="(boxitem,index) in mainboxList">{{boxitem.name}}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
            <div class="cs-layout-breadcrumb">
                <Breadcrumb>
                    <BreadcrumbItem href="#">Index</BreadcrumbItem>
                    <BreadcrumbItem href="#">Apps</BreadcrumbItem>
                    <BreadcrumbItem>App</BreadcrumbItem>
                </Breadcrumb>
            </div>
            <div class="cs-layout-content">
                <div class="cs-layout-content-main">
                    <router-view></router-view>
                </div>
            </div>
            <div class="cs-layout-copy">
                2018
            </div>
            </Col>
        </Row>
    </div>
</template>
<script>
    /*导入脚本*/
    import Tool from './../../libs/tool';

    export default {
        name: 'ch_panel_container',
        data() {
            return {
                debug: true,
                spanLeft: 4,
                spanRight: 20,
                mainboxList: [{
                    name:'默认',
                    value:'default'
                },{
                    name:'白点',
                    value:'dot'
                },{
                    name:'滤镜',
                    value:'filter'
                },{
                    name:'斜线',
                    value:'whitecross'
                },{
                    name:'方块',
                    value:'bigblock'
                }],
                mainboxTheme: '',
                visible: false
            }
        },
        mounted() {
            this.initMainBoxTheme();
            let len = this.mainboxList.length,
                index = Math.floor(Math.random() * len);
            this.mainboxTheme = `cs-layout-mainbox-${this.mainboxList[index]['value']}`;
        },
        computed: {
            iconSize() {
                return this.spanLeft === 4 ? 14 : 24;
            }
        },
        methods: {
            initMainBoxTheme(){
                let cache=Tool.getParams();
                console.log(cache);
            },
            changeMainBoxTheme(index){
                console.log(index);
                this.mainboxTheme=`cs-layout-mainbox-${this.mainboxList[index]['value']}`;
            },
            toggleClick() {
                if (this.spanLeft === 4) {
                    this.spanLeft = 2;
                    this.spanRight = 22;
                } else {
                    this.spanLeft = 4;
                    this.spanRight = 20;
                }
            },
            handleOpen() {
                this.visible = true;
            },
            handleClose() {
                this.visible = false;
            }
        }
    };
</script>
