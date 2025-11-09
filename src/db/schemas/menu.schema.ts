// model Menus {
//   id           String      @id @default(uuid()) @map("id")
//   name         String      @db.VarChar(255)
//   description  String      @db.Text
//   price        Int
//   available    Boolean     @default(false)
//   quantity     Int         @default(0)
//   franchiseId  String      @map("franchise_id")
//   franchise    Franchises  @relation(fields: [franchiseId], references: [id])
//   createdAt    DateTime    @default(now()) @map("created_at")
//   updatedAt    DateTime    @updatedAt @map("updated_at")
// }