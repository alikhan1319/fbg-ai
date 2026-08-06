import { createUseCaseRoute } from "@/lib/use-case-route";

const route = createUseCaseRoute("/remove-background");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
