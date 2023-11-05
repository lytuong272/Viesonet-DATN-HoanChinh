package com.viesonet.dao;

import com.viesonet.entity.FavoriteProducts;
import com.viesonet.entity.Posts;
import com.viesonet.entity.Products;
import com.viesonet.entity.Violations;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

public interface ProductsDao extends JpaRepository<Products, Integer> {
        @Query("SELECT p FROM Products p " +
                        "INNER JOIN p.favoriteProducts f " +
                        "WHERE f.user.userId = :userId")
        Page<Products> findFavoriteProductsByUserId(String userId, Pageable pageable);

        @Query("SELECT p FROM Products p " +
                        "INNER JOIN p.favoriteProducts f " +
                        "WHERE f.user.userId = :userId")
        List<Products> findFavoriteProductsByUserId1(String userId);

        @Query("SELECT p FROM Products p WHERE p.user.userId IN :userId AND p.productStatus.statusId=1")
        List<Products> getShopping(List<String> userId);

        // lấy danh sách sản phẩm người đang theo dõi trong khu mua sắm
        @Query("SELECT p FROM Products p WHERE p.user.userId IN :userId AND p.productStatus.statusId=1")
        Page<Products> getShoppingByPage(List<String> userId, Pageable pageable);

        @Query("SELECT p FROM Products p WHERE p.productId IN :productId AND p.productStatus.statusId = 1")
        Page<Products> getTrending(List<Integer> productId, Pageable pageable);

        @Query("SELECT p FROM Products p WHERE p.productStatus.statusId = 3")
        Page<Object> findPostsProductWithProcessing(Pageable pageable);

        @Query("SELECT p FROM Products p WHERE p.user.userId = :userId ORDER BY p.datePost DESC LIMIT 4")
        List<Products> getRelatedProducts(String userId);

        @Query("SELECT p FROM Products p WHERE p.user.userId =:userId AND p.productStatus.statusId = 1")
        Page<Products> findPostsProductMyStore(Pageable pageable, String userId);

        @Query("SELECT p FROM Products p WHERE p.user.userId =:userId AND p.productStatus.statusId = 3")
        Page<Products> findPostsProductPending(Pageable pageable, String userId);

        @Query("SELECT p FROM Products p WHERE p.productStatus.statusId = 5")
        Page<Object> findPostsProductWithDecline(Pageable pageable);

        @Query("SELECT p FROM Products p WHERE p.productStatus.statusId = 3 and p.productName LIKE %:name%")
        List<Object> findSearchProducts(@Param("name") String name);

        @Query("SELECT p FROM Products p WHERE p.productStatus.statusId = 1 and p.productName LIKE %:name%")
        Page<Products> findProductByName(Pageable pageable, String name);

        @Query("SELECT p FROM Products p WHERE p.productStatus.statusId = 1 AND p.user.userId =:userId AND p.productName LIKE %:name%")
        Page<Products> findSearchProductMyStore(String name, String userId, Pageable pageable);

        Products findByProductId(int productId);

        @Procedure("sp_SPBANCHAY")
        List<Object[]> exeproductBestSelling(String sellerId);
}