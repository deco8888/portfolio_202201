<?php if (!empty($reference_list)) :  ?>
    <div class="p-detail-content__reference">
        <?php foreach ($reference_list as $reference) : ?>
            <?php if (isset($reference['title'])) :  ?>
                <?php echo $reference['title']; ?>
                <br>
                <a class="p-content__link" href="<?php echo $reference['url']; ?>">
                    <?php echo $reference['site_name']; ?>
                </a>
            <?php else : ?>
                <br><br>
                <a class="p-content__link" href="<?php echo $reference['url']; ?>">
                    <?php echo $reference['site_name']; ?>
                </a>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
<?php endif; ?>