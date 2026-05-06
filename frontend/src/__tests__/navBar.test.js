import { mount } from '@vue/test-utils';

import navBar from '../components/navBar.vue';

describe('navBar - Component de navegació', () => {

    // TEST 1
    test('Ha de muntar el component sense errors', () => {
        const wrapper = mount(navBar, {
            global: {
                stubs: {
                    'router-link': true,
                    'RouterLink': true
                }
            }
        });

        expect(wrapper.exists()).toBe(true);
    });

    // TEST 2
    test('Ha de generar contingut HTML', () => {
        const wrapper = mount(navBar, {
            global: {
                stubs: {
                    'router-link': true,
                    'RouterLink': true
                }
            }
        });

        expect(wrapper.html()).not.toBe('');
        expect(wrapper.html().length).toBeGreaterThan(10);
    });
});
