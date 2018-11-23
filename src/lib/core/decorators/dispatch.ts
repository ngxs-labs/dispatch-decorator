import { Store } from '@ngxs/store';

import { InjectorAccessor } from '../services/injector-accessor.service';

/**
 * Event can be a plain object or an instance of some class
 *
 * @param event - Dispatched event
 * @returns - True if plain object or instance constructor has `type` property
 */
function hasTypeProperty<T extends object>(event: T): boolean {
    return event.hasOwnProperty('type') || event.constructor.hasOwnProperty('type');
}

/**
 * @param event - Dispatched event
 * @returns - True if event is an object and has `type` property
 */
function isValidEvent<T extends object>(event: T): boolean {
    return !!event && typeof event === 'object' && hasTypeProperty<T>(event);
}

/**
 * Descriptor exists only in case of method decorating
 *
 * @param descriptor - Property descriptor
 * @returns - True if descriptor exists
 */
function descriptorExists(descriptor: TypedPropertyDescriptor<Function> | undefined): boolean {
    return !!descriptor && descriptor.hasOwnProperty('value');
}

/**
 * @returns - A factory for method decorating
 */
export function Dispatch(): PropertyDecorator {
    return (target: any, key: string | symbol, descriptor?: TypedPropertyDescriptor<Function>) => {
        let originalValue: Function = null!;

        const wrapped = function(...args: any[]) {
            const event = originalValue.apply(target, args);
            const isInvalidEvent = !isValidEvent(event);

            if (isInvalidEvent) {
                throw new Error(`Your method \`${target.name}.${key.toString()}\` seems to return an invalid object`);
            }

            return InjectorAccessor.getInjector().get<Store>(Store).dispatch(event) && event;
        };

        const methodDecorated = descriptorExists(descriptor);

        if (methodDecorated) {
            originalValue = descriptor!.value!;
            descriptor!.value = wrapped;
        } else {
            Object.defineProperty(target, key, {
                set: (lambda: Function) => {
                    originalValue = lambda;
                },
                get: () => wrapped
            });
        }
    };
}
