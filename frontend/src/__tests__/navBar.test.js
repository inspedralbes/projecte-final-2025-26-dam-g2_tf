// ─────────────────────────────────────────────────────────────
// TESTS DEL COMPONENT navBar.vue
// ─────────────────────────────────────────────────────────────
// Comprova que el component de navegació es munta correctament
// i mostra els elements esperats.
// ─────────────────────────────────────────────────────────────

// mount: munta el component com si estigués al navegador
import { mount } from '@vue/test-utils';

// Importem el component que volem testar
import navBar from '../components/navBar.vue';

// ─── GRUP DE TESTS ───────────────────────────────────────────
describe('navBar - Component de navegació', () => {

    // TEST 1: El component s'ha de poder muntar sense errors
    test('Ha de muntar el component sense errors', () => {
        // mount() "renderitza" el component en un DOM virtual
        const wrapper = mount(navBar, {
            // Creem un stub del router-link perquè al test no tenim vue-router
            global: {
                stubs: {
                    'router-link': true,
                    'RouterLink': true
                }
            }
        });

        // Si existeix el component, el test passa
        expect(wrapper.exists()).toBe(true);
    });

    // TEST 2: El component ha de generar HTML (no estar buit)
    test('Ha de generar contingut HTML', () => {
        const wrapper = mount(navBar, {
            global: {
                stubs: {
                    'router-link': true,
                    'RouterLink': true
                }
            }
        });

        // El HTML no ha d'estar buit
        expect(wrapper.html()).not.toBe('');
        expect(wrapper.html().length).toBeGreaterThan(10);
    });
});
