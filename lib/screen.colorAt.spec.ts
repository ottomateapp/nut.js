import {Image, loadImage, Point, Region, RGBA, ScreenClass, ScreenProviderInterface} from "../index";
import {mockPartial} from "sneer";
import providerRegistry, {ProviderRegistry} from "./provider/provider-registry.class";
import {ImageProcessor} from "./provider/image-processor.interface";

const searchRegion = new Region(0, 0, 1000, 1000);
const providerRegistryMock = mockPartial<ProviderRegistry>({
    getScreen(): ScreenProviderInterface {
        return mockPartial<ScreenProviderInterface>({
            grabScreenRegion(): Promise<Image> {
                return Promise.resolve(new Image(searchRegion.width, searchRegion.height, new ArrayBuffer(0), 3, "needle_image"));
            },
            screenSize(): Promise<Region> {
                return Promise.resolve(searchRegion);
            }
        })
    },
    getImageProcessor(): ImageProcessor {
        return providerRegistry.getImageProcessor();
    }
});

describe("colorAt", () => {
    it("should return the correct RGBA value for a given pixel", async () => {
        // GIVEN
        const screenshot = loadImage(`${__dirname}/../e2e/assets/checkers.png`);
        const grabScreenMock = jest.fn(() => Promise.resolve(screenshot));
        providerRegistryMock.getScreen = jest.fn(() => mockPartial<ScreenProviderInterface>({
            grabScreen: grabScreenMock
        }));
        providerRegistryMock.getImageProcessor()
        const SUT = new ScreenClass(providerRegistryMock);
        const expectedWhite = new RGBA(255, 255, 255, 255);
        const expectedBlack = new RGBA(0, 0, 0, 255);

        // WHEN
        const white = await SUT.colorAt(new Point(64, 64));
        const black = await SUT.colorAt(new Point(192, 64));

        // THEN
        expect(white).toStrictEqual(expectedWhite);
        expect(black).toStrictEqual(expectedBlack);
    });
});