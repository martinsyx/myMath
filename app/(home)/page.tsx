import AdditionPracticePage from "@/components/addition/AdditionPracticePage"

export default function HomePage() {
  return (
    <AdditionPracticePage
      metadataOverrides={{
        path: "/",
        canonical: "https://kids-math.com",
      }}
    />
  )
}
